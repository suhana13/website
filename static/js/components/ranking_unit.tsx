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
 * Component for rendering a single ranking list.
 */

import _ from "lodash";
import React, { RefObject, useContext } from "react";

import { RankingUnitUrlFuncContext } from "../../js/shared/context";
import { ASYNC_ELEMENT_CLASS } from "../constants/css_constants";
import { formatNumber, LocalizedLink } from "../i18n/i18n";
import { RankingPoint } from "../types/ranking_unit_types";

interface RankingUnitPropType {
  title: string;
  points: RankingPoint[];
  /**
   * If true, rows are ordered from highest ranks to lowest, e.g., 1,2,3...
   * Otherwise, from lowest to highest, e.g., n,n-1,n-2,...
   */
  isHighest: boolean;
  unit?: string[];
  /**
   * React ref for outermost div of this element
   */
  forwardRef?: RefObject<HTMLDivElement>;
  scaling?: number[];
  /**
   * Total number of points. This is used for calculating ranks if isHighest is false
   * (ordering from lowest ranks to highest) and ranks are not provided, e.g., n,n-1,n-2,...
   */
  numDataPoints?: number;
  /**
   * The row with the dcid will be bolded.
   */
  highlightedDcid?: string;
  /**
   * If true, only the ranks and labels will be shown and not the values.
   */
  hideValue?: boolean;
  /**
   * For multi-column, these are the display strings for the value columns, in order.
   * TODO: Add better support for multi-column by adding a single list of columns:
   *       columns: { unt: string; scaling: number; name: string }[];
   */
  svNames?: string[];
}

// Calculates ranks based on the order of data if no rank is provided.
function getRank(
  isHighest: boolean,
  index: number,
  numberOfTotalDataPoints?: number
): number {
  if (isHighest) {
    return index + 1;
  }
  return numberOfTotalDataPoints ? numberOfTotalDataPoints - index : index + 1;
}

export function RankingUnit(props: RankingUnitPropType): JSX.Element {
  const urlFunc = useContext(RankingUnitUrlFuncContext);

  return (
    <div
      className={"ranking-list " + ASYNC_ELEMENT_CLASS}
      ref={props.forwardRef}
    >
      <h4>{props.title}</h4>
      <table>
        {props.svNames && !props.hideValue && (
          <thead>
            <tr>
              <td></td>
              <td></td>
              {props.svNames.map((name, i) => (
                <td key={i} className="stat">
                  {name}
                </td>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {props.points.map((point, i) => {
            return (
              <tr key={point.placeDcid}>
                <td
                  className={`rank ${
                    point.placeDcid === props.highlightedDcid ? "bold" : ""
                  }`}
                >
                  {point.rank
                    ? point.rank
                    : getRank(props.isHighest, i, props.numDataPoints)}
                  .
                </td>
                <td
                  className={`place-name ${
                    point.placeDcid === props.highlightedDcid ? "bold" : ""
                  }`}
                >
                  <LocalizedLink
                    href={urlFunc(point.placeDcid)}
                    text={point.placeName || point.placeDcid}
                  />
                </td>
                {!props.hideValue && _.isEmpty(point.values) && (
                  <td className="stat">
                    <span
                      className={`num-value ${
                        point.placeDcid === props.highlightedDcid ? "bold" : ""
                      }`}
                    >
                      {formatNumber(
                        !_.isEmpty(props.scaling) && props.scaling[0]
                          ? point.value * props.scaling[0]
                          : point.value,
                        props.unit && props.unit.length ? props.unit[0] : "",
                        false
                      )}
                    </span>
                  </td>
                )}
                {!props.hideValue &&
                  !_.isEmpty(point.values) &&
                  point.values.map((v, i) => (
                    <td key={i} className="stat">
                      <span
                        className={`num-value ${
                          point.placeDcid === props.highlightedDcid
                            ? "bold"
                            : ""
                        }`}
                      >
                        {formatNumber(
                          !_.isEmpty(props.scaling) && props.scaling[i]
                            ? v * props.scaling[i]
                            : v,
                          props.unit && props.unit.length ? props.unit[i] : "",
                          false
                        )}
                      </span>
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
