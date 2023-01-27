/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Component for rendering a tile which ranks events by severity.
 */

import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";

import { ChartEmbed } from "../../place/chart_embed";
import { NamedTypedPlace } from "../../shared/types";
import { loadSpinner, removeSpinner } from "../../shared/util";
import {
  DisasterDataOptions,
  DisasterEventPoint,
  DisasterEventPointData,
} from "../../types/disaster_event_map_types";
import {
  EventTypeSpec,
  TopEventTileSpec,
} from "../../types/subject_page_proto_types";
import { rankingPointsToCsv } from "../../utils/chart_csv_utils";
import {
  fetchDisasterEventPoints,
  getDate,
  getSeverityFilters,
  getUseCache,
} from "../../utils/disaster_event_map_utils";
import { formatNumber } from "../../utils/string_utils";

const RANKING_COUNT = 10;
const NUM_FRACTION_DIGITS = 0;

interface TopEventTilePropType {
  id: string;
  title: string;
  place: NamedTypedPlace;
  topEventMetadata: TopEventTileSpec;
  eventTypeSpec: EventTypeSpec;
  blockId: string;
  className?: string;
}

export function TopEventTile(props: TopEventTilePropType): JSX.Element {
  const [topEvents, setTopEvents] = useState<
    DisasterEventPoint[] | undefined
  >();
  // options used for the previous data fetch
  const prevDataOptions = useRef<DisasterDataOptions>(null);
  const embedModalElement = useRef<ChartEmbed>(null);
  const chartContainer = useRef(null);
  const eventTypeSpecs = {
    [props.eventTypeSpec.id]: props.eventTypeSpec,
  };
  const severityProp = props.eventTypeSpec.defaultSeverityFilter.prop;
  const spinnerId = `${props.id}-spinner`;

  useEffect(() => {
    fetchData();
  }, [props]);

  useEffect(() => {
    // watch for hash change and re-fetch data whenever hash changes.
    function handleHashChange(): void {
      fetchData();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [props.place, props.eventTypeSpec]);

  if (topEvents === undefined) {
    return <></>;
  }

  return (
    <div
      className={`chart-container ranking-tile ${props.className}`}
      ref={chartContainer}
    >
      {_.isEmpty(topEvents) ? (
        <p>There were no severe events in that time period.</p>
      ) : (
        <div className="ranking-unit-container">
          <div className="ranking-list">
            <h4>{props.title}</h4>
            <table>
              <tbody>
                {topEvents.map((event, i) => {
                  return (
                    <tr key={i}>
                      <td className="rank">{i + 1}</td>
                      <td className="place-name">
                        <a href={`/browser/${event.placeDcid}`}>
                          {event.placeName}
                        </a>
                      </td>
                      <td className="stat">
                        <span className="num-value">
                          {formatNumber(
                            event.severity[severityProp],
                            props.eventTypeSpec.defaultSeverityFilter.unit,
                            false,
                            NUM_FRACTION_DIGITS
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <footer>
              <a
                href="#"
                onClick={(event) => {
                  handleEmbed(event, topEvents);
                }}
              >
                Export
              </a>
            </footer>
          </div>
        </div>
      )}
      <ChartEmbed ref={embedModalElement} />
      <div id={spinnerId}>
        <div className="screen">
          <div id="spinner"></div>
        </div>
      </div>
    </div>
  );

  function fetchData() {
    const dataOptions = {
      eventTypeSpecs: [props.eventTypeSpec],
      selectedDate: getDate(props.blockId),
      severityFilters: getSeverityFilters(eventTypeSpecs, props.blockId),
      useCache: getUseCache(),
      place: props.place.dcid,
    };
    if (
      prevDataOptions.current &&
      _.isEqual(prevDataOptions.current, dataOptions)
    ) {
      return;
    }
    prevDataOptions.current = dataOptions;
    loadSpinner(spinnerId);
    fetchDisasterEventPoints(dataOptions)
      .then((disasterEventData) => {
        const sources = new Set<string>();
        Object.values(disasterEventData.provenanceInfo).forEach((provInfo) => {
          sources.add(provInfo.provenanceUrl);
        });
        rankEventData(disasterEventData);
        removeSpinner(spinnerId);
      })
      .catch(() => {
        setTopEvents(undefined);
        removeSpinner(spinnerId);
      });
  }

  function rankEventData(disasterEventData: DisasterEventPointData) {
    const filteredPoints = disasterEventData.eventPoints.filter(
      (a) => !_.isEmpty(a.severity)
    );
    filteredPoints.sort(
      (a, b) => b.severity[severityProp] - a.severity[severityProp]
    );
    const topEvents = filteredPoints.slice(0, RANKING_COUNT);
    setTopEvents(topEvents);
  }

  function handleEmbed(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    topEvents: DisasterEventPoint[]
  ): void {
    e.preventDefault();
    const rankingPoints = topEvents.map((point) => {
      return {
        placeDcid: point.placeDcid,
        placename: point.placeName,
        value: point.severity[severityProp],
      };
    });
    embedModalElement.current.show(
      "",
      rankingPointsToCsv(rankingPoints),
      chartContainer.current.offsetWidth,
      0,
      "",
      "",
      []
    );
  }
}