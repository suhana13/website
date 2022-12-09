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

import { MapPoint } from "../chart/types";
import { NamedPlace, NamedTypedPlace } from "../shared/types";
import { DisasterType } from "./constants";

/**
 * Types specific to Disaster Dashboard
 */

export interface PlaceInfo {
  place: NamedTypedPlace;
  placeType: string;
  parentPlaces: NamedPlace[];
}
export interface DisasterEventPoint extends MapPoint {
  disasterType: DisasterType;
  startDate: string;
  intensity: { [prop: string]: number };
  endDate?: string;
}

export interface DisasterApiEventPoint {
  eventId: string;
  name: string;
  startDate: string;
  affectedPlaces: string[];
  longitude: number;
  latitude: number;
  endDate?: string;
  magnitude?: number;
  directDeaths?: number;
  directInjuries?: number;
}
