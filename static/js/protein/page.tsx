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

/**
 * Main component for bio.
 */

 import axios from "axios";
 import { number } from "prop-types";
 import React from "react";
 
 import { GraphNodes } from "../shared/types";
 import { drawTissueScoreChart } from "./chart";
 import { drawProteinInteractionChart } from "./chart";
 import { drawDiseaseGeneAssocChart } from "./chart";
 import { drawVarTypeAssocChart } from "./chart";
 import { drawVarSigAssocChart } from "./chart";
 import { drawChemGeneAssocChart } from "./chart";
 
 interface PagePropType {
   dcid: string;
   nodeName: string;
 }
 
 interface PageStateType {
   data: GraphNodes;
 }
 
 export class Page extends React.Component<PagePropType, PageStateType> {
   constructor(props: PagePropType) {
     super(props);
     this.state = { data: null };
   }
 
   componentDidMount(): void {
     this.fetchData();
   }
 
   componentDidUpdate(): void {
     const data: { name: string; value: string }[] = [];
     const tissueScore = this.getTissueScore();
     const interactionScore = this.getProteinInteraction();
     const diseaseGeneAssoc = this.getDiseaseGeneAssoc(); 
     const varGeneAssoc = this.getVarGeneAssoc();
     const varTypeAssoc = this.getVarTypeAssoc();
     const varSigAssoc = this.getVarSigAssoc();
     const chemGeneAssoc = this.getChemicalGeneAssoc();
     drawTissueScoreChart("tissue-score-chart", tissueScore);
     drawProteinInteractionChart("protein-confidence-score-chart", interactionScore);
     drawDiseaseGeneAssocChart("disease-gene-association-chart", diseaseGeneAssoc);
     //drawVariantGeneAssocChart("variant-gene-association-chart", varGeneAssoc);
     drawVarTypeAssocChart("variant-type-association-chart", varTypeAssoc);
     drawVarSigAssocChart("variant-significance-association-chart", varSigAssoc);
     drawChemGeneAssocChart("chemical-gene-association-chart", chemGeneAssoc);
   }
 
   render(): JSX.Element {
     // TODO: use d3 to draw bar chart here.
     return (
       <>
         <h2>{this.props.nodeName}</h2>
         <h6>Protein Tissue Association</h6>
         <div id="tissue-score-chart"></div>
         <h6>Protein Protein Interaction</h6>
         <div id="protein-confidence-score-chart"></div>
         <h6>Disease Gene Association</h6>
         <div id="disease-gene-association-chart"></div>
         <h6>Variant Gene Association</h6>
         <div id="variant-type-association-chart"></div>
         <div id="variant-significance-association-chart"></div>
         <h6>Chemical Gene Association</h6>
         <div id = "chemical-gene-association-chart"></div>
       </>
     );
   }
 
   private fetchData(): void {
     axios.get("/api/protein/" + this.props.dcid).then((resp) => {
       this.setState({
         data: resp.data,
       });
     });
   }
 
   private getTissueScore(): { name: string; value: string }[] {
     // Tissue to score mapping.
     if (!this.state.data) {
       return [];
     }
     const result = {};
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "detectedProtein") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let tissue = null;
         let score = null;
         for (const n of node.neighbors) {
           if (n.property === "humanTissue") {
             tissue = n.nodes[0].value;
           } else if (n.property === "proteinExpressionScore") {
             score = n.nodes[0].value;
           }
         }
         result[tissue] = score;
       }
       const data: { name: string; value: string }[] = [];
       for (const tissue in result) {
         data.push({ name: tissue, value: result[tissue] });
       }
       return data;
     }
     return [];
   }
   private getProteinInteraction(): { name: string; value: number }[] {
     // Protein Interaction to confidence score mapping.
     if (!this.state.data) {
       return [];
     }
     const result = {};
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "interactingProtein") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let protein_name = null;
         let confidence_score = null;
         for (const n of node.neighbors) {
           if (n.property === "name") {
             protein_name = n.nodes[0].value;
           } else if (n.property === "confidenceScore") {
             for (const n1 of n.nodes) {
               console.log(n1)
               for(const n2 of n1.neighbors) {
                 if(n2.property === "value") {
                   let num = Number(n2.nodes[0].value);
                   if(num <= 1) {confidence_score = n2.nodes[0].value;}
                   //confidence_score = n2.nodes[0].value;
                 }
               }
                 
             }
           }
         }
         result[protein_name] = confidence_score;
       }
       const data: { name: string; value: number }[] = [];
       for (const protein_name in result) {
         data.push({ name: protein_name, value: result[protein_name] });
       }
       return data;
     }
     return [];
   }
 
   private getDiseaseGeneAssoc(): { name: string; value: number }[] {
     // Disease Gene Associations
     if (!this.state.data) {
       return [];
     }
     const result = {};
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "geneID") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let score = null;
         let disease = null;
           for (const n of node.neighbors) {
             if (n.property === "geneID") {
               for(const n1 of n.nodes) {
                 for(const n2 of n1.neighbors) {
                   //console.log(n2); 
                   if(n2.property === "diseaseOntologyID") {
                       //console.log(n2);
                       for(const n3 of n2.nodes) {
                         //console.log(n3);
                         if(n3.neighbors !== undefined) {
                           //console.log(n3.neighbors);
                           for(const n4 of n3.neighbors) {
                             if(n4.property === "commonName") {
                               disease = n4.nodes[0].value;
                             }
                           }
                         }
                         
                       }
                   } else if(n2.property === "associationConfidenceInterval") {
                     score = n2.nodes[0].value;
                   }
                 }
                 result[disease] = score;
               }
             } 
           }
           
       }
       const data: { name: string; value: number }[] = [];
       for (const disease in result) {
         data.push({ name: disease, value: result[disease] });
       }
       return data;
     }
     return [];
   }
 
   private getVarGeneAssoc(): { name: string; value: number }[] {
     // Variant Gene Associations
     if (!this.state.data) {
       return [];
     }
     const result = {};
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "geneID") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let score = null;
         let variant = null;
           //console.log(node);
           for (const n of node.neighbors) {
             if (n.property === "geneSymbol") {
               //console.log(n);
               for(const n1 of n.nodes) {
                 //console.log(n1);
                 for(const n2 of n1.neighbors) {
                   console.log(n2); 
                   if(n2.property === "associatedTissue") {
                     console.log(n2);
                     /*
                       //console.log(n2);
                       for(const n3 of n2.nodes) {
                         //console.log(n3);
                         if(n3.neighbors !== undefined) {
                           //console.log(n3.neighbors);
                           for(const n4 of n3.neighbors) {
                             if(n4.property === "name") {
                               variant = n4.nodes[0].value;
                             }
                           }
                         }
                         
                       }
                   */} else if(n2.property === "log2AllelicFoldChange") {
                     console.log(n2);
                     score = n2.nodes[0].value;
                   } else if(n2.property === "log2AllelicConfidenceInterval") {
 
                   }
                 }
                 result[variant] = score;
               }
             } 
           }
           
       }
       const data: { name: string; value: number }[] = [];
       for (const variant in result) {
         data.push({ name: variant, value: result[variant] });
       }
       return data;
     }
     return [];
   }
 
   private getVarTypeAssoc(): { name: string; value: number }[] {
     // Variant Gene Associations
     if (!this.state.data) {
       return [];
     }
     const result: { name: string; value: number }[] = [];
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "geneID") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let variant = null;
           for (const n of node.neighbors) {
             if (n.property === "geneID") {
               for(const n1 of n.nodes) {        
                 for(const n2 of n1.neighbors) {
                   if(n2.property === "geneticVariantFunctionalCategory") {
                     let count = 0;            
                     variant = n2.nodes[0].value;
                     count = 1;
                     result.push({ name: variant, value: count });
                   } 
                 }
               }
             } 
           }
           
       }
       var data = [];
       result.forEach(function (element) {
         if (!this[element.name]) {
             this[element.name] = { name: element.name, value: 0 };
             data.push(this[element.name]);
         }
         this[element.name].value += element.value;
       }, Object.create(null));
       return data;
     }
     return [];
   }
 
   private getVarSigAssoc(): { name: string; value: number }[] {
     // Variant Gene Associations
     if (!this.state.data) {
       return [];
     }
     const result: { name: string; value: number }[] = [];
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "geneID") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let variant = null;
           for (const n of node.neighbors) {
             if (n.property === "geneID") {
               for(const n1 of n.nodes) {        
                 for(const n2 of n1.neighbors) {
                   if(n2.property === "clinicalSignificance") {
                     let count = 0;            
                     variant = n2.nodes[0].value;
                     count = 1;
                     result.push({ name: variant, value: count });
                   } 
                 }
               }
             } 
           }
           
       }
       var data = [];
       result.forEach(function (element) {
         if (!this[element.name]) {
             this[element.name] = { name: element.name, value: 0 };
             data.push(this[element.name]);
         }
         this[element.name].value += element.value;
       }, Object.create(null));
       return data;
     }
     return [];
   }
 
   private getChemicalGeneAssoc(): { name: string; value: number }[] {
     // Chem Gene Associations
     if (!this.state.data) {
       return [];
     }
     const result: { name: string; value: number }[] = [];
     for (const neighbour of this.state.data.nodes[0].neighbors) {
       if (neighbour.property !== "geneID") {
         continue;
       }
       for (const node of neighbour.nodes) {
         let association = null;
           for (const n of node.neighbors) {
             if (n.property === "geneID") {
               for(const n1 of n.nodes) {
                 for(const n2 of n1.neighbors) {
                   if(n2.property === "relationshipAssociationType") {
                     let count = 0;
                     association = n2.nodes[0].value;
                     console.log(n2.nodes[0].value);
                     count = 1;
                     result.push({ name: association, value: count });}
 
                 }
               }
             } 
           }
           
       }
       var data = [];
       result.forEach(function (element) {
         if (!this[element.name]) {
             this[element.name] = { name: element.name, value: 0 };
             data.push(this[element.name]);
         }
         this[element.name].value += element.value;
       }, Object.create(null));
 
       var addObject = [{name: "RelationshipAssociationTypeAssociated", value: 0}, {name: "RelationshipAssociationTypeNotAssociated", value: 0}, {name: "RelationshipAssociationTypeAmbiguous", value: 0}];
       addObject.forEach( obj1 => {
         if(!data.find( obj2 => obj2.name===obj1.name ))
             data.push({name: obj1.name, value: obj1.value})
       })
 
       return data;
     }
     return [];
   }
 }
