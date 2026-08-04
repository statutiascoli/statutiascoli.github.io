#!/usr/bin/env python3
"""
Generate reusable research datasets from the canonical Statuti Ascoli TEI file.

The TEI file is the canonical scholarly source.
Generated JSON/CSV files are derived research datasets.

Usage:
    python scripts/generate_datasets.py
    python scripts/generate_datasets.py --tei statutiAscoli1496.xml --output datasets
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any

from lxml import etree


TEI_NS = "http://www.tei-c.org/ns/1.0"
NS = {"tei": TEI_NS}
XML_ID = "{http://www.w3.org/XML/1998/namespace}id"
BASE_TEXT_URL = "https://statutiascoli.it/statuti.html?id="
BASE_PEOPLE_URL = "https://statutiascoli.it/persone.html?id="
BASE_EVENTS_URL = "https://statutiascoli.it/calendario.html?id="
BASE_CATEGORIES_URL = "https://statutiascoli.it/categorie.html?id="
BASE_CITY_URL = "https://statutiascoli.it/citt%C3%A0.html?id="
BASE_TERRITORY_URL = "https://statutiascoli.it/territorio.html?id="

CITY_PLACE_GROUPS = {
    "quartieri",
    "sestieri",
    "porteCittadine",
    "elementiCittadini",
    "chiese",
}


def normalise_text(element: etree._Element | None) -> str:
    if element is None:
        return ""
    return " ".join("".join(element.itertext()).split())


def strip_hash(value: str | None) -> str:
    if not value:
        return ""
    return value[1:] if value.startswith("#") else value


def split_pointers(value: str | None) -> list[str]:
    if not value:
        return []
    return [strip_hash(v) for v in value.split() if v.strip()]


def first(element: etree._Element, xpath: str) -> etree._Element | None:
    result = element.xpath(xpath, namespaces=NS)
    return result[0] if result else None


def ancestor(element: etree._Element, xpath: str) -> etree._Element | None:
    result = element.xpath(xpath, namespaces=NS)
    return result[0] if result else None


def rubric_id(rubric: etree._Element | None) -> str:
    if rubric is None:
        return ""
    return strip_hash(rubric.get("corresp")) or rubric.get(XML_ID, "")


def derived_text_unit_id(unit: etree._Element) -> str:
    """Return xml:id, rubric @corresp, or a predictable structural fallback."""
    if unit.get("type") == "rubrica":
        value = rubric_id(unit)
        if value:
            return value

    if unit.get(XML_ID):
        return unit.get(XML_ID, "")

    unit_type = unit.get("type", "unit")
    book = ancestor(unit, "ancestor::tei:div[@type='libro'][1]")
    volume = ancestor(unit, "ancestor::tei:div[@type='volume'][1]")

    if book is not None and book.get(XML_ID):
        return f"{book.get(XML_ID)}_{unit_type}"
    if volume is not None and volume.get(XML_ID):
        return f"{volume.get(XML_ID)}_{unit_type}"

    return unit_type


def person_name(person: etree._Element) -> str:
    pers_name = first(person, "./tei:persName")
    if pers_name is None:
        return ""

    parts: list[str] = []
    for tag in ("forename", "surname"):
        for node in pers_name.xpath(f"./tei:{tag}", namespaces=NS):
            text = normalise_text(node)
            if text:
                parts.append(text)

    add_names = [
        normalise_text(node)
        for node in pers_name.xpath("./tei:addName", namespaces=NS)
        if normalise_text(node)
    ]

    name = " ".join(parts).strip()
    if add_names:
        name += f" ({'; '.join(add_names)})"
    return name or normalise_text(pers_name)


def text_unit_label(
    unit: etree._Element,
    volume_id: str,
    book_id: str,
) -> str:
    """Build a human-readable Italian label for a navigable textual unit."""
    volume_labels = {
        "statCom": "Statuti del Comune",
        "statPop": "Statuti del Popolo",
    }
    volume_label = volume_labels.get(volume_id, volume_id)

    unit_type = unit.get("type", "")
    number = unit.get("n", "")

    if unit_type == "rubrica":
        book = ancestor(unit, "ancestor::tei:div[@type='libro'][1]")
        book_number = book.get("n", "") if book is not None else ""
        return f"{volume_label}, libro {book_number}, rubrica {number}".strip(", ")

    if book_id:
        book = ancestor(unit, "ancestor::tei:div[@type='libro'][1]")
        book_number = book.get("n", "") if book is not None else ""
        type_labels = {
            "intro": "introduzione",
            "indice": "indice",
            "conclusione": "conclusione",
        }
        unit_label = type_labels.get(unit_type, unit_type)
        return f"{volume_label}, libro {book_number}, {unit_label}".strip(", ")

    if volume_id:
        type_labels = {
            "intro": "introduzione",
            "indice": "indice",
            "conclusione": "conclusione",
        }
        unit_label = type_labels.get(unit_type, unit_type)
        return f"{volume_label}, {unit_label}".strip(", ")

    root_labels = {
        "intro": "Introduzione agli Statuti di Ascoli",
        "indice": "Indice degli Statuti di Ascoli",
        "conclusione": "Conclusione degli Statuti di Ascoli",
    }
    return root_labels.get(unit_type, unit_type or derived_text_unit_id(unit))


def entity_appearances_by_text_unit(
    root: etree._Element,
    element_to_id: dict[int, str],
) -> dict[str, dict[str, set[str]]]:
    """Collect person, place, and event IDs occurring in each navigable text unit."""
    result: dict[str, dict[str, set[str]]] = {}

    def add(kind: str, xpath: str) -> None:
        for node in root.xpath(xpath, namespaces=NS):
            unit = ancestor(
                node,
                "ancestor::tei:div[@type='rubrica' or @type='intro' or @type='indice' or @type='conclusione'][1]",
            )
            if unit is None:
                continue

            unit_id = element_to_id.get(id(unit), derived_text_unit_id(unit))
            if not unit_id:
                continue

            bucket = result.setdefault(
                unit_id,
                {"people": set(), "places": set(), "events": set()},
            )
            for entity_id in split_pointers(node.get("corresp")):
                bucket[kind].add(entity_id)

    add("people", ".//tei:text//tei:persName[@corresp]")
    add(
        "places",
        ".//tei:text//*[self::tei:placeName or self::tei:geogName][@corresp]",
    )

    event_ids = {
        event.get(XML_ID, "")
        for event in root.xpath(".//tei:listEvent/tei:event", namespaces=NS)
    }
    for node in root.xpath(".//tei:text//*[@corresp]", namespaces=NS):
        matching_event_ids = [
            entity_id
            for entity_id in split_pointers(node.get("corresp"))
            if entity_id in event_ids
        ]
        if not matching_event_ids:
            continue

        unit = ancestor(
            node,
            "ancestor::tei:div[@type='rubrica' or @type='intro' or @type='indice' or @type='conclusione'][1]",
        )
        if unit is None:
            continue

        unit_id = element_to_id.get(id(unit), derived_text_unit_id(unit))
        bucket = result.setdefault(
            unit_id,
            {"people": set(), "places": set(), "events": set()},
        )
        bucket["events"].update(matching_event_ids)

    return result


def build_text_unit_index(root: etree._Element) -> tuple[list[dict[str, Any]], dict[int, str]]:
    """
    Reproduce the public navigation paths used by statuti.html.

    Website hierarchy:
      root intro/conclusion: <top-level index>
      volume intro:          <volume index>_<child index>
      book unit:             <volume index>_<book index>_<unit index>

    Content containers are not navigable; their rubric children are.
    """
    body_root = first(root, ".//tei:text/tei:body/tei:div")
    if body_root is None:
        return [], {}

    records: list[dict[str, Any]] = []
    element_to_id: dict[int, str] = {}

    top_level_units = [
        child
        for child in body_root
        if isinstance(child.tag, str) and etree.QName(child).localname == "div"
    ]

    for top_index, top in enumerate(top_level_units):
        top_type = top.get("type", "")
        top_id = derived_text_unit_id(top)

        if top_type != "volume":
            record = text_unit_record(
                top,
                top_id,
                str(top_index),
                volume_id="",
                book_id="",
            )
            records.append(record)
            element_to_id[id(top)] = top_id
            continue

        volume_id = top.get(XML_ID, "")
        navigable_volume_children = [
            child
            for child in top
            if isinstance(child.tag, str) and etree.QName(child).localname == "div"
        ]

        for child_index, child in enumerate(navigable_volume_children):
            child_type = child.get("type", "")

            if child_type != "libro":
                unit_id = derived_text_unit_id(child)
                path = f"{top_index}_{child_index}"
                records.append(
                    text_unit_record(
                        child,
                        unit_id,
                        path,
                        volume_id=volume_id,
                        book_id="",
                    )
                )
                element_to_id[id(child)] = unit_id
                continue

            book_id = child.get(XML_ID, "")
            website_unit_index = 0

            for book_child in child:
                if not isinstance(book_child.tag, str):
                    continue
                if etree.QName(book_child).localname != "div":
                    continue

                book_child_type = book_child.get("type", "")

                if book_child_type == "content":
                    for rubric in book_child.xpath("./tei:div[@type='rubrica']", namespaces=NS):
                        unit_id = derived_text_unit_id(rubric)
                        path = f"{top_index}_{child_index}_{website_unit_index}"
                        records.append(
                            text_unit_record(
                                rubric,
                                unit_id,
                                path,
                                volume_id=volume_id,
                                book_id=book_id,
                            )
                        )
                        element_to_id[id(rubric)] = unit_id
                        website_unit_index += 1
                    continue

                unit_id = derived_text_unit_id(book_child)
                path = f"{top_index}_{child_index}_{website_unit_index}"
                records.append(
                    text_unit_record(
                        book_child,
                        unit_id,
                        path,
                        volume_id=volume_id,
                        book_id=book_id,
                    )
                )
                element_to_id[id(book_child)] = unit_id
                website_unit_index += 1

    return records, element_to_id


def text_unit_record(
    unit: etree._Element,
    unit_id: str,
    website_path: str,
    volume_id: str,
    book_id: str,
) -> dict[str, Any]:
    unit_type = unit.get("type", "")
    heading = first(unit, "./tei:head[@type='titoloRubrica']")
    summary = first(unit, "./tei:note[@type='summary']")

    if unit_type == "rubrica":
        text_nodes = unit.xpath("./tei:p", namespaces=NS)
        title = normalise_text(heading)
    elif unit_type == "indice":
        text_nodes = unit.xpath("./tei:p | ./tei:list", namespaces=NS)
        title = ""
    else:
        text_nodes = unit.xpath("./tei:p", namespaces=NS)
        title = ""

    text_parts = [normalise_text(node) for node in text_nodes if normalise_text(node)]

    return {
        "id": unit_id,
        "url": f"{BASE_TEXT_URL}{website_path}",
        "label": text_unit_label(unit, volume_id, book_id),
        "type": unit_type,
        "volume_id": volume_id,
        "book_id": book_id,
        "title": title,
        "text": "\n\n".join(text_parts),
        "summary": normalise_text(summary),
        "categories": [
            {
                "id": category_id,
                "url": f"{BASE_CATEGORIES_URL}{category_id}",
            }
            for category_id in split_pointers(unit.get("ana"))
        ],
        "facsimiles": unit.get("facs", "").split(),
    }


def text_unit_appearances(
    root: etree._Element,
    xpath: str,
    element_to_id: dict[int, str],
    text_unit_urls: dict[str, str],
) -> dict[str, list[dict[str, str]]]:
    appearances: dict[str, set[str]] = {}

    for node in root.xpath(xpath, namespaces=NS):
        unit = ancestor(
            node,
            "ancestor::tei:div[@type='rubrica' or @type='intro' or @type='indice' or @type='conclusione'][1]",
        )
        if unit is None:
            continue

        text_unit_id = element_to_id.get(id(unit), derived_text_unit_id(unit))
        if not text_unit_id:
            continue

        for entity_id in split_pointers(node.get("corresp")):
            appearances.setdefault(entity_id, set()).add(text_unit_id)

    return {
        entity_id: [
            {"id": unit_id, "url": text_unit_urls.get(unit_id, "")}
            for unit_id in sorted(unit_ids)
        ]
        for entity_id, unit_ids in appearances.items()
    }


def place_url(place: etree._Element, place_id: str) -> str:
    """Return the public URL for a place according to the site's city/territory split."""
    containing_list = ancestor(place, "ancestor::tei:listPlace[@type][1]")
    group = containing_list.get("type", "") if containing_list is not None else ""
    base_url = BASE_CITY_URL if group in CITY_PLACE_GROUPS else BASE_TERRITORY_URL
    return f"{base_url}{place_id}"


def extract_people(
    root: etree._Element,
    element_to_id: dict[int, str],
    text_unit_urls: dict[str, str],
) -> list[dict[str, Any]]:
    appearances = text_unit_appearances(
        root,
        ".//tei:text//tei:persName[@corresp]",
        element_to_id,
        text_unit_urls,
    )
    records: list[dict[str, Any]] = []

    for person in root.xpath(".//tei:listPerson/tei:person", namespaces=NS):
        person_id = person.get(XML_ID, "")
        pers_name = first(person, "./tei:persName")
        occupations = [
            normalise_text(node)
            for node in person.xpath("./tei:occupation", namespaces=NS)
            if normalise_text(node)
        ]
        place_index = {
            place.get(XML_ID, ""): place
            for place in root.xpath(".//tei:listPlace//tei:place", namespaces=NS)
        }
        residences = []
        for node in person.xpath("./tei:residence", namespaces=NS):
            residence_place_id = strip_hash(node.get("corresp"))
            residence_place = place_index.get(residence_place_id)
            residences.append(
                {
                    "label": normalise_text(node),
                    "place_id": residence_place_id,
                    "url": (
                        place_url(residence_place, residence_place_id)
                        if residence_place is not None
                        else ""
                    ),
                }
            )

        records.append(
            {
                "id": person_id,
                "url": f"{BASE_PEOPLE_URL}{person_id}",
                "name": person_name(person),
                "occupations": occupations,
                "residences": residences,
                "authority_uri": pers_name.get("ref", "") if pers_name is not None else "",
                "note": normalise_text(first(person, "./tei:note")),
                "text_units": appearances.get(person_id, []),
            }
        )

    return records

def extract_places(
    root: etree._Element,
    element_to_id: dict[int, str],
    text_unit_urls: dict[str, str],
) -> list[dict[str, Any]]:
    appearances = text_unit_appearances(
        root,
        ".//tei:text//*[self::tei:placeName or self::tei:geogName][@corresp]",
        element_to_id,
        text_unit_urls,
    )
    records: list[dict[str, Any]] = []

    for place in root.xpath(".//tei:listPlace//tei:place", namespaces=NS):
        place_id = place.get(XML_ID, "")
        name_node = first(place, "./tei:placeName | ./tei:geogName")

        records.append(
            {
                "id": place_id,
                "url": place_url(place, place_id),
                "name": normalise_text(name_node),
                "type": name_node.get("type", "") if name_node is not None else "",
                "authority_uri": name_node.get("ref", "") if name_node is not None else "",
                "note": normalise_text(first(place, "./tei:note")),
                "text_units": appearances.get(place_id, []),
            }
        )

    return records

def extract_events(
    root: etree._Element,
    element_to_id: dict[int, str],
    text_unit_urls: dict[str, str],
) -> list[dict[str, Any]]:
    event_ids = {
        event.get(XML_ID, "")
        for event in root.xpath(".//tei:listEvent/tei:event", namespaces=NS)
    }
    appearances: dict[str, list[dict[str, str]]] = {}

    raw_appearances = text_unit_appearances(
        root,
        ".//tei:text//*[@corresp]",
        element_to_id,
        text_unit_urls,
    )
    appearances = {
        event_id: raw_appearances.get(event_id, [])
        for event_id in event_ids
    }
    records: list[dict[str, Any]] = []

    for event in root.xpath(".//tei:listEvent/tei:event", namespaces=NS):
        event_id = event.get(XML_ID, "")
        label = first(event, "./tei:label")
        when = event.get("when", "")

        if not when:
            continue

        records.append(
            {
                "id": event_id,
                "url": f"{BASE_EVENTS_URL}{event_id}",
                "label": normalise_text(label),
                "date": when,
                "authority_uri": event.get("ref", ""),
                "note": normalise_text(first(event, "./tei:note")),
                "text_units": appearances.get(event_id, []),
            }
        )

    return records

def extract_rubric_categories(
    root: etree._Element,
    text_unit_urls: dict[str, str],
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []

    for rubric in root.xpath(".//tei:div[@type='rubrica'][@ana]", namespaces=NS):
        current_rubric_id = rubric_id(rubric)
        records.append(
            {
                "rubric_id": current_rubric_id,
                "rubric_url": text_unit_urls.get(current_rubric_id, ""),
                "categories": [
                    {
                        "id": category_id,
                        "url": f"{BASE_CATEGORIES_URL}{category_id}",
                    }
                    for category_id in split_pointers(rubric.get("ana"))
                ],
            }
        )

    return records


def rubric_categories_csv_records(
    root: etree._Element,
    text_unit_urls: dict[str, str],
) -> list[dict[str, str]]:
    """Return one rubric-category relation per CSV row."""
    records: list[dict[str, str]] = []

    for rubric in root.xpath(".//tei:div[@type='rubrica'][@ana]", namespaces=NS):
        current_rubric_id = rubric_id(rubric)
        for category_id in split_pointers(rubric.get("ana")):
            records.append(
                {
                    "rubric_id": current_rubric_id,
                    "rubric_url": text_unit_urls.get(current_rubric_id, ""),
                    "category_id": category_id,
                    "category_url": f"{BASE_CATEGORIES_URL}{category_id}",
                }
            )

    return records

def extract_internal_references(
    root: etree._Element,
    element_to_id: dict[int, str],
    text_unit_urls: dict[str, str],
) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []

    for link in root.xpath(".//tei:text//tei:seg[@type='internal-link']", namespaces=NS):
        source_unit = ancestor(
            link,
            "ancestor::tei:div[@type='rubrica' or @type='intro' or @type='indice' or @type='conclusione'][1]",
        )
        if source_unit is None:
            continue

        source_id = element_to_id.get(id(source_unit), derived_text_unit_id(source_unit))

        for target_id in split_pointers(link.get("corresp")):
            records.append(
                {
                    "source_text_unit_id": source_id,
                    "source_url": text_unit_urls.get(source_id, ""),
                    "target_text_unit_id": target_id,
                    "target_url": text_unit_urls.get(target_id, ""),
                    "label": normalise_text(link),
                }
            )

    return records

def flatten_for_csv(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        if not value:
            return ""
        if all(isinstance(item, dict) for item in value):
            return " | ".join(
                "; ".join(
                    f"{key}={item_value}"
                    for key, item_value in item.items()
                    if item_value not in ("", None, [])
                )
                for item in value
            )
        return " | ".join(str(item) for item in value)
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return str(value)


def write_json(path: Path, records: list[dict[str, Any]]) -> None:
    path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def write_csv(path: Path, records: list[dict[str, Any]]) -> None:
    if not records:
        path.write_text("", encoding="utf-8")
        return

    fieldnames = list(records[0].keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for record in records:
            writer.writerow(
                {key: flatten_for_csv(record.get(key)) for key in fieldnames}
            )


def generate_datasets(tei_path: Path, output_dir: Path) -> dict[str, int]:
    parser = etree.XMLParser(remove_blank_text=False)
    tree = etree.parse(str(tei_path), parser)
    root = tree.getroot()

    text_units, element_to_id = build_text_unit_index(root)
    text_unit_urls = {record["id"]: record["url"] for record in text_units}
    entity_appearances = entity_appearances_by_text_unit(root, element_to_id)

    for record in text_units:
        entities = entity_appearances.get(
            record["id"],
            {"people": set(), "places": set(), "events": set()},
        )
        record["people"] = [
            {
                "id": entity_id,
                "url": f"{BASE_PEOPLE_URL}{entity_id}",
            }
            for entity_id in sorted(entities["people"])
        ]
        record["places"] = [
            {
                "id": entity_id,
                "url": next(
                    (
                        place_url(place, entity_id)
                        for place in root.xpath(
                            ".//tei:listPlace//tei:place[@xml:id=$place_id]",
                            namespaces=NS,
                            place_id=entity_id,
                        )
                    ),
                    "",
                ),
            }
            for entity_id in sorted(entities["places"])
        ]
        record["events"] = [
            {
                "id": entity_id,
                "url": f"{BASE_EVENTS_URL}{entity_id}",
            }
            for entity_id in sorted(entities["events"])
        ]

    datasets = {
        "people": extract_people(root, element_to_id, text_unit_urls),
        "places": extract_places(root, element_to_id, text_unit_urls),
        "events": extract_events(root, element_to_id, text_unit_urls),
        "text_units": text_units,
        "rubric_categories": extract_rubric_categories(root, text_unit_urls),
        "internal_references": extract_internal_references(
            root,
            element_to_id,
            text_unit_urls,
        ),
    }

    output_dir.mkdir(parents=True, exist_ok=True)

    for name, records in datasets.items():
        write_json(output_dir / f"{name}.json", records)

        if name == "rubric_categories":
            csv_records = rubric_categories_csv_records(root, text_unit_urls)
            write_csv(output_dir / f"{name}.csv", csv_records)
        else:
            write_csv(output_dir / f"{name}.csv", records)

    return {name: len(records) for name, records in datasets.items()}

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate reusable JSON and CSV datasets from Statuti Ascoli TEI."
    )
    parser.add_argument(
        "--tei",
        type=Path,
        default=Path("statutiAscoli1496.xml"),
        help="Path to the canonical TEI XML file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("datasets"),
        help="Directory for generated datasets.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.tei.is_file():
        print(f"Error: TEI file not found: {args.tei}", file=sys.stderr)
        return 1

    try:
        counts = generate_datasets(args.tei, args.output)
    except (OSError, etree.XMLSyntaxError) as exc:
        print(f"Error while generating datasets: {exc}", file=sys.stderr)
        return 1

    print(f"Datasets generated in: {args.output.resolve()}")
    for name, count in counts.items():
        print(f"  {name}: {count}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
