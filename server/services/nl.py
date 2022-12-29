# Copyright 2022 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Language Model client."""

from google.cloud import storage
from sentence_transformers import SentenceTransformer
from sentence_transformers.util import semantic_search

import os
import torch
from datasets import load_dataset
import logging

BUILDS = [
    'demographics300', 'uncurated3000', 'demographics300-withpalmalternatives',
    'combined_all'
]
GCS_BUCKET = 'datcom-csv'
EMBEDDINGS = 'embeddings/'
TEMP_DIR = '/tmp/'
MODEL_NAME = 'all-MiniLM-L6-v2'


class Model:
  """Holds clients for the language model"""

  def __init__(self, ner_model):
    self.model = SentenceTransformer(MODEL_NAME)
    self.ner_model = ner_model
    self.dataset_embeddings_maps = {}
    self._download_embeddings()
    self.dcid_maps = {}
    for build in BUILDS:
      logging.info('Loading build {}'.format(build))
      ds = load_dataset('csv',
                        data_files=os.path.join(TEMP_DIR,
                                                f'embeddings_{build}.csv'))
      df = ds["train"].to_pandas()
      self.dcid_maps[build] = df['dcid'].values.tolist()
      df = df.drop('dcid', axis=1)
      self.dataset_embeddings_maps[build] = torch.from_numpy(df.to_numpy()).to(
          torch.float)

  def _download_embeddings(self):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name=GCS_BUCKET)
    blobs = bucket.list_blobs(prefix=EMBEDDINGS)  # Get list of files
    for blob in blobs:
      _, filename = os.path.split(blob.name)
      blob.download_to_filename(os.path.join(TEMP_DIR, filename))  # Download

  def detect_svs(self, query, embeddings_build):
    query_embeddings = self.model.encode([query])
    if embeddings_build not in self.dataset_embeddings_maps:
      return ValueError(f'Embeddings Build: {embeddings_build} was not found.')
    hits = semantic_search(query_embeddings,
                           self.dataset_embeddings_maps[embeddings_build],
                           top_k=10)

    # Note: multiple results may map to the same DCID. As well, the same string may
    # map to multiple DCIDs with the same score.
    sv2score = {}
    for e in hits[0]:
      for d in self.dcid_maps[embeddings_build][e['corpus_id']].split(','):
        s = e['score']
        # Prefer the top score.
        if d not in sv2score:
          sv2score[d] = s

    # Sort by scores
    sv2score_sorted = sorted(sv2score.items(),
                             key=lambda item: item[1],
                             reverse=True)
    svs_sorted = [k for (k, _) in sv2score_sorted]
    scores_sorted = [v for (_, v) in sv2score_sorted]

    return {'SV': svs_sorted, 'CosineScore': scores_sorted}

  def detect_place(self, query):
    doc = self.ner_model(query)
    places_found_loc_gpe = []
    places_found_fac = []
    for e in doc.ents:
      # Preference is given to LOC and GPE types over FAC.
      # List of entity types recognized by the spaCy library
      # is here: https://towardsdatascience.com/explorations-in-named-entity-recognition-and-was-eleanor-roosevelt-right-671271117218
      # We only use the location/place types.
      if e.label_ in ["GPE", "LOC"]:
        places_found_loc_gpe.append(str(e))
      if e.label_ in ["FAC"]:
        places_found_fac.append(str(e))

    if places_found_loc_gpe:
      return places_found_loc_gpe
    return places_found_fac