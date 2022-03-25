/**
 * Copyright 2021 Google LLC
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

 import * as d3 from "d3";

 const SVGNS = "http://www.w3.org/2000/svg";
 const XLINKNS = "http://www.w3.org/1999/xlink";
 const HEIGHT = 224;
 const WIDTH = 500;
 const BAR_HEIGHT = 35;
 const MARGIN = { top: 30, right: 30, bottom: 70, left: 90 };
 
 /**
  * Draw bar chart for tissue score.
  */
 export function drawTissueScoreChart(
   id: string,
   data: { name: string; value: string }[]
 ): void {
   const testData = data;
   /*
   Convert the tissue expression level to numerical values 
   * @param val value of the data array 
   */
   function convertData(val) {
     if (val == "ProteinExpressionNotDetected") {
       return 0;
     } else if (val == "ProteinExpressionLow") {
       return 1;
     } else if (val == "ProteinExpressionMedium") {
       return 2;
     } else if (val == "ProteinExpressionHigh") {
       return 3;
     }
   }

   function formatTick(d) {
    if (d == 0) {
        return "NotDetected";
    } else if (d == 1) {
        return "Low";
    } else if (d == 2) {
        return "Medium";
    } else if (d == 3) {
        return "High";
    }
    };

    var obj_color = {
      'AdiposeTissue':'khaki', 'AdrenalGland':'bisque', 'Appendix':'peru', 'BoneMarrow':'lightyellow',
              'Breast':'mistyrose', 'Bronchus':'tomato', 'Cartilage':'seashell',
              'Caudate':'lightcoral', 'Cerebellum':'lightcoral', 'CerebralCortex':'lightcoral',
              'CervixUterine':'mistyrose', 'ChoroidPlexus':'lightcoral',
              'Colon':'maroon', 'DorsalRaphe':'lightcoral', 'Duodenum':'firebrick',
              'Endometrium1':'mistyrose', 'Endometrium2':'mistyrose',
              'Epididymis':'mistyrose', 'Esophagus':'chocolate', 'Eye':'coral',
              'FallopianTube':'mistyrose', 'Gallbladder':'rosybrown',
              'Hair':'salmon', 'HeartMuscle':'brown', 'Hippocampus':'lightcoral',
              'Hypothalamus':'lightcoral', 'Kidney':'bisque', 'LactatingBreast':'mistyrose',
              'Liver':'darksalmon','Lung':'tomato', 'LymphNode':'indianred', 
                'Nasopharynx':'tomato', 'OralMucosa':'darkorange', 'Ovary':'mistyrose',
              'Pancreas':'orangered', 'ParathyroidGland':'snow', 'PituitaryGland':'sienna',
              'Placenta':'mistyrose', 'Prostate':'mistyrose', 'Rectum':'maroon', 
              'Retina':'coral', 'SalivaryGland':'lightsalmon', 'SeminalVesicle':'mistyrose',
              'SkeletalMuscle':'linen', 'Skin':'peachpuff', 'Skin1':'peachpuff',
              'Skin2':'peachpuff', 'SmallIntestine':'ivory', 'SmoothMuscle':'red', 
              'SoftTissue1':'burlywood', 'SoftTissue2':'burlywood', 'Spleen':'tan',
              'Stomach1':'darkred', 'Stomach2':'darkred', 'SubstantiaNiagra':'lightcoral',
              'Testis':'mistyrose', 'Thymus':'indianred', 'ThyroidGland':'snow',
              'Tonsil':'saddlebrown', 'UrinaryBladder':'sandybrown', 'Vagina':'mistyrose'
    }

   function barColor(d) {
     var name = d;
     return(obj_color[name])
   };
 
   interface newData{
     name: string;
     value: number;
   }
   const reformattedData = data.map((item) => {
     var newObj = {} as newData
     newObj["name"] = item.name;
     newObj["value"] = convertData(item.value);
     return newObj;
   });

   reformattedData.sort(function(x, y) {
    var a = barColor(x.name);
    var b = barColor(y.name);
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  });
 
   const arr_name = reformattedData.map((y) => {
     return y.name;
   });
 
   const height = 200 - MARGIN.top - MARGIN.bottom;
   const width = 860 - MARGIN.left - MARGIN.right;

   var svg = d3.selectAll("#tissue-score-chart")
  .append("svg")
    .attr("width", width + MARGIN.left + MARGIN.right)
    .attr("height", height + MARGIN.top + MARGIN.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGIN.left + "," + MARGIN.top + ")");
   /*
   const svg = d3
     .selectAll("#" + id)
     .append("svg")
     .attr("xmlns", SVGNS)
     .attr("xmlns:xlink", XLINKNS)
     .attr("width", WIDTH)
     .attr("height", HEIGHT);
    */

   var x = d3
     .scaleBand()
     .range([0, width])
     .domain(reformattedData.map(function(d) {return d.name;}))
     .padding(0.15);
   svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
   const y = d3
     .scaleLinear()
     .domain([0, 3])
     .range([height,0]);
   svg.append("g")
     .call(d3.axisLeft(y).ticks(4).tickFormat(formatTick));
   reformattedData.sort(function(x, y) {
      var a = barColor(x.name);
      var b = barColor(y.name);
      if(a < b) { return -1; }
      if(a > b) { return 1; }
      return 0;
    });

   svg
     .selectAll("mybar")
     .data(reformattedData)
     .enter()
     .append("rect")
        .attr("x", (d) => x(d.name))
        .attr("y", (d) => y(d.value))
        .attr("height", function(d) { return height - y(d.value); })
        .attr("width", x.bandwidth())
        .style("fill", function (d) {return barColor(d.name)})
        .on("mouseover", function (d, i) {
          d3.select(this).transition().duration(50).style("opacity", 0.5);
        })
        .on("mouseout", function (d, i) {
          d3.select(this).transition().duration(50).style("opacity", 1);
        });  
 }
 
  export function drawProteinInteractionChart(
    id: string,
    data : {name: string; value: number}[]
  ) : void {
       const height = 400 - MARGIN.top - MARGIN.bottom;
       const width = 700 - MARGIN.left - MARGIN.right;
       data.sort((a, b) => {
        return b.value - a.value;
      });
       const slicedArray = data.slice(0, 10);
       const size = slicedArray.map(x => { return x.name;});

       function formatTick(d) {
        d = d.replace("P53_HUMAN", "")
        d = d.replace(/_+$/, '')
        d = d.replace(/^[_]+/, '');
        return d;
        };

       var svg = d3.selectAll("#protein-confidence-score-chart")
       .append("svg")
         .attr("width", width + MARGIN.left + MARGIN.right)
         .attr("height", height + MARGIN.top + MARGIN.bottom)
       .append("g")
         .attr("transform",
               "translate(" + MARGIN.left + "," + MARGIN.top + ")");
     
       var x = d3.scaleLinear()
         .domain([0, 1])
         .range([0, width]);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
       var y = d3.scaleBand()
         .domain(size)
         .range([0, height])
         .padding(0.1);
      svg.append("g")
        .call(d3.axisLeft(y).tickFormat(formatTick))

   svg.selectAll("rect")
     .data(slicedArray)
     .enter()
     .append("rect")
     .attr("x", x(0))
     .attr("y", (d) => y(d.name))
     .attr("width", d => x(d.value))
     .attr("height", y.bandwidth())
       .style("fill", "peachpuff")
       .on('mouseover', function (d, i) {
               d3.select(this).transition()
                     .duration(50)
                     .style("fill", "maroon");})
       .on('mouseout', function (d, i) {
               d3.select(this).transition()
                     .duration(50)
                     .style("fill", "peachpuff")});
   
   
 
 }
 
 export function drawDiseaseGeneAssocChart(
   id: string,
   data : {name: string; value: number}[]
 ) : void {
      const tmpData = [
       {name: 'Obesity', value: 0.5},
       {name: 'Diabetes mellitus', value: 4},
       {name: 'Crohns disease', value: 3.1},
       {name: 'overnutrition', value: 1.4}
      ];
      const height = 400 - MARGIN.top - MARGIN.bottom;
      const width = 800 - MARGIN.left - MARGIN.right;
      const slicedArray = data.slice(0, 10);
      slicedArray.sort((a, b) => {
        return b.value - a.value;
      });
      const size = slicedArray.map(x => { return x.name;});
      var svg = d3.selectAll("#disease-gene-association-chart")
      .append("svg")
        .attr("width", width + MARGIN.left + MARGIN.right)
        .attr("height", height + MARGIN.top + MARGIN.bottom)
      .append("g")
        .attr("transform",
            "translate(" + MARGIN.left + "," + MARGIN.top + ")");

      var x = d3.scaleLinear()
        .domain([0, d3.max(slicedArray, (d) => d.value)])
        .range([0, width]);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
      var y = d3.scaleBand()
        .domain(size)
        .range([0, height])
        .padding(0.1);
      svg.append("g")
      .call(d3.axisLeft(y))

      svg.selectAll("rect")
     .data(slicedArray)
     .enter()
     .append("rect")
     .attr("x", x(0))
     .attr("y", (d) => y(d.name))
     .attr("width", d => x(d.value))
     .attr("height", y.bandwidth())
       .style("fill", "maroon")
       .on('mouseover', function (d, i) {
               d3.select(this).transition()
                     .duration(50)
                     .style("fill", "peachpuff");})
       .on('mouseout', function (d, i) {
               d3.select(this).transition()
                     .duration(50)
                     .style("fill", "maroon")});

 }
 
 export function drawVarTypeAssocChart(
   id: string,
   data : {name: string; value: number}[]
 ) : void {
     //TODO: convert data to tmpData format (counts)
      const tmpData = [
       {name: "5'UTR", value: 7},
       {name: "3'UTR", value: 8},
       {name: "Splice 3'", value: 2},
       {name: "Splice 5'", value: 1},
       {name: 'Frameshift', value: 2},
       {name: 'ncRNA', value: 1},
       {name: 'Nonsense', value: 2},
       {name: 'cds Indel', value: 5}
      ];
      const height = 400 - MARGIN.top - MARGIN.bottom;
      const width = 700 - MARGIN.left - MARGIN.right;
      data.sort((a, b) => {
        return b.value - a.value;
      });
      console.log(data);
      const size = data.map(x => { return x.name;});
      

      var svg = d3.selectAll("#variant-type-association-chart")
       .append("svg")
         .attr("width", width + MARGIN.left + MARGIN.right)
         .attr("height", height + MARGIN.top + MARGIN.bottom)
       .append("g")
         .attr("transform",
               "translate(" + MARGIN.left + "," + MARGIN.top + ")");
      var x = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([0, width]);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
      var y = d3.scaleBand()
      .domain(size)
      .range([0, height])
      .padding(0.1);
      svg.append("g")
      .call(d3.axisLeft(y))
 
      svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0))
      .attr("y", (d) => y(d.name))
      .attr("width", d => x(d.value))
      .attr("height", y.bandwidth())
        .style("fill", "peachpuff")
        .on('mouseover', function (d, i) {
                d3.select(this).transition()
                      .duration(50)
                      .style("fill", "maroon");})
        .on('mouseout', function (d, i) {
                d3.select(this).transition()
                      .duration(50)
                      .style("fill", "peachpuff")});
        
 }
 
 export function drawVarSigAssocChart(
   id: string,
   data : {name: string; value: number}[]
 ) : void {
     //TODO: convert data to tmpData format (counts)
      const tmpData = [
       {name: 'Untested', value: 7},
       {name: 'Unknown', value: 8},
       {name: 'Uncertain', value: 2},
       {name: 'Not Provided', value: 1},
       {name: 'Other', value: 2},
       {name: 'Benign', value: 1},
       {name: 'Protective', value: 2},
       {name: 'Pathogenic', value: 5}
      ];
      const barHeight = 35;
      const margin = { top: 70, right: 50, bottom: 10, left: 50 };
      const height = 400 - margin.top - margin.bottom;
      const width = 460 - margin.left - margin.right;
 
      const size = data.map(x => { return x.name;});
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
      const y = d3.scaleBand()
        .domain(size)
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);
      const svg = d3.selectAll("#" + id).append('svg')
      .attr("xmlns", SVGNS)
      .attr("xmlns:xlink", XLINKNS)
      .attr("width", WIDTH)
      .attr("height", HEIGHT);
 
       svg.append("g")
         .selectAll("rect")
         .data(data.sort((a, b) => d3.descending(a.value, b.value)))
         .join("rect")
           .attr("x", x(0))
           .attr("y", (d) => y(d.name))
           .attr("width", d => x(d.value) - x(0))
           .attr("height", y.bandwidth())
           .style("fill", "crimson")
           .on('mouseover', function (d, i) {
                   d3.select(this).transition()
                         .duration(50)
                         .style("fill", "maroon");})
           .on('mouseout', function (d, i) {
                   d3.select(this).transition()
                         .duration(50)
                         .style("fill", "crimson")});
       
       
       svg.append("g")
           .attr("fill", "white")
           .attr("text-anchor", "end")
           .attr("font-family", "sans-serif")
           .attr("font-size", 3)
           .selectAll("text")
           .data(data.sort((a, b) => d3.descending(a.value, b.value)))
           .join("text")
           .attr("x", d => x(d.value))
           .attr("y", (d, i) => i + y.bandwidth() / 2)
           .attr("dy", "0.35em")
           .attr("dx", -4)
           .call((text) =>
                   text
                   .filter((d) => x(d.value) - x(0) < 20) // short bars
                   .attr("dx", +2)
                   .attr("fill", "black")
                   .attr("text-anchor", "start")
               );
       svg.append("g")
         .attr("transform", `translate(0,${margin.top})`)
         .call(d3.axisTop(x)
                   .ticks(3))
         .call(g => g.select(".domain").remove());
       svg.append("g")
         .attr("transform", `translate(${margin.left},0)`)
         .call(
             d3
             .axisLeft(y)
             .tickSizeOuter(0));
 
 }
 
 export function drawChemGeneAssocChart(
   id: string,
   data : {name: string; value: number}[]
 ) : void {
     //TODO: convert data to tmpData format (counts)
      const tmpData = [
       {name: "Not Associated", value: 7},
       {name: "Ambiguous", value: 8},
       {name: "Associated", value: 2},
      ];
      const margin = { top: 70, right: 50, bottom: 10, left: 50 };
      const height = 400 - margin.top - margin.bottom;
      const width = 800 - margin.left - margin.right;
      const size = data.map(x => { return x.name;});
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .range([margin.left, width - margin.right]);
      const y = d3.scaleBand()
        .domain(size)
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);
      const svg = d3.selectAll("#" + id).append('svg')
      .attr("xmlns", SVGNS)
      .attr("xmlns:xlink", XLINKNS)
      .attr("width", WIDTH)
      .attr("height", HEIGHT);
 
       svg.append("g")
         .selectAll("rect")
         .data(data.sort((a, b) => d3.descending(a.value, b.value)))
         .join("rect")
           .attr("x", x(0))
           .attr("y", (d) => y(d.name))
           .attr("width", d => x(d.value) - x(0))
           .attr("height", y.bandwidth())
           .style("fill", "crimson")
           .on('mouseover', function (d, i) {
                   d3.select(this).transition()
                         .duration(50)
                         .style("fill", "maroon");})
           .on('mouseout', function (d, i) {
                   d3.select(this).transition()
                         .duration(50)
                         .style("fill", "crimson")});
       
       
       svg.append("g")
           .attr("fill", "white")
           .attr("text-anchor", "end")
           .attr("font-family", "sans-serif")
           .attr("font-size", 3)
           .selectAll("text")
           .data(data.sort((a, b) => d3.descending(a.value, b.value)))
           .join("text")
           .attr("x", d => x(d.value))
           .attr("y", (d, i) => i + y.bandwidth() / 2)
           .attr("dy", "0.35em")
           .attr("dx", -4)
           .call((text) =>
                   text
                   .filter((d) => x(d.value) - x(0) < 20) // short bars
                   .attr("dx", +2)
                   .attr("fill", "black")
                   .attr("text-anchor", "start")
               );
       svg.append("g")
         .attr("transform", `translate(0,${margin.top})`)
         .call(d3.axisTop(x)
                   .ticks(3))
         .call(g => g.select(".domain").remove());
       svg.append("g")
         .attr("transform", `translate(${margin.left},0)`)
         .call(
             d3
             .axisLeft(y)
             .tickSizeOuter(0));
 
 }
 
 
 
 
     
 /*
  export function drawDiseaseGeneAssocChart(
   id: string,
   data : {name: string; value: number}[]
 ) : void {
   
 }
 */
  
 
