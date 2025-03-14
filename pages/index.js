// pages/index.js

import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

// Map each category title to its corresponding folder under public/
const categoryFolderMap = {
  'Data Relationship': 'dataRelationship',
  'Data Dimension': 'dimension',
  'Data Scale': 'dataScale',
  'Visualization': 'visualization',
  'Data-binding type': 'data-bindingType',
  'Analogy strategies': 'strategies',
};

// EXAMPLE: Map folder -> attributes (customize this to your real data)
const cardAttributeMap = {
  Waterfall: ['Flow', 'Part-to-Whole', 'Magnitude', 'Bivariate', 'Interval', 'Ratio', 'Accumulation', 'Length', 'Time'],
  BarChart: ['Magnitude', 'Bivariate', 'Comparison', 'Length', 'Interval', 'Ratio'],
  Histogram: ['Distribution', 'Univariate', 'Interval', 'Ratio', 'Proportion', 'Area'],
  StackedArea: ['Temporal', 'Bivariate', 'Comparison', 'Area', 'Ratio', 'Accumulation'],
  Sunburst: ['Part-to-Whole', 'Multivariate', 'Proportion', 'Area', 'Interval', 'Ratio'],
  Treemap: ['Part-to-Whole', 'Multivariate', 'Proportion', 'Area', 'Interval', 'Ratio'],
  BubbleChart: ['Ranking', 'Multivariate', 'Ratio', 'Unitization', 'Area'],
  ButterflyChart: ['Deviation', 'Bivariate', 'Nominal', 'Ordinal', 'Comparison', 'Length'],
  Heatmap: ['Correlation', 'Multivariate', 'Interval', 'Unitization', 'Temperature'],
  Sankey: ['Flow', 'Magnitude', 'Bivariate', 'Proportion', 'Interval', 'Ratio', 'Area'],
  // Add others if needed:
  // AnotherFolderName: ['Deviation', 'Ordinal', 'Comparison'],
};

export async function getStaticProps() {
  // Path to public/finalQuestionare
  const finalQuestionareDir = path.join(process.cwd(), 'public', 'finalQuestionare');
  const filesAndFolders = fs.readdirSync(finalQuestionareDir);

  // Filter only directories
  let analogyFolders = filesAndFolders.filter((name) => {
    const fullPath = path.join(finalQuestionareDir, name);
    return fs.lstatSync(fullPath).isDirectory();
  });

  // Define a custom order for certain folders
  const customOrder = ['Waterfall', 'BarChart', 'Histogram', 'StackedArea', 'Sunburst', 'Treemap'];

  // Sort the folders so those in customOrder appear first, then alphabetical fallback
  analogyFolders = analogyFolders.sort((a, b) => {
    const aIndex = customOrder.indexOf(a);
    const bIndex = customOrder.indexOf(b);

    // Both in customOrder -> sort by their position in customOrder
    if (aIndex >= 0 && bIndex >= 0) {
      return aIndex - bIndex;
    }
    // Only one in customOrder -> that one goes first
    if (aIndex >= 0 && bIndex < 0) {
      return -1;
    }
    if (aIndex < 0 && bIndex >= 0) {
      return 1;
    }
    // Neither in customOrder -> sort alphabetically
    return a.localeCompare(b);
  });

  return {
    props: {
      analogyFolders,
    },
  };
}

export default function Home({ analogyFolders }) {
  /**
   * Each "category" on the left has:
   * - title: e.g. "Data Relationship"
   * - items: array of strings, each representing an image name under the matching folder
   */
  const selectionData = [
    {
      title: 'Data Relationship',
      items: [
        'Deviation',
        'Correlation',
        'Ranking',
        'Distribution',
        'Temporal',
        'Part-to-Whole',
        'Magnitude',
        'Flow',
      ],
    },
    {
      title: 'Data Scale',
      items: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    },
    {
      title: 'Data-binding type',
      items: ['Length', 'Area', 'Time', 'Temperature'],
    },
    {
      title: 'Data Dimension',
      items: ['Univariate', 'Bivariate', 'Multivariate'],
    },
    {
      title: 'Analogy strategies',
      items: ['Comparison', 'Unitization', 'Accumulation', 'Proportion'],
    },
  ];

  // 1) Keep track of active filters in state
  const [selectedFilters, setSelectedFilters] = useState([]);

  // 2) Handler to toggle a filter when a button is clicked
  const handleFilterToggle = (filter) => {
    setSelectedFilters((prev) => {
      // If already selected, remove it
      if (prev.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }
      // Otherwise, add it
      return [...prev, filter];
    });
  };

  // 3) Determine if a card should be shown based on selectedFilters
  //    "Show if the card has ANY attribute in selectedFilters"
  const isCardVisible = (folderName) => {
    // If no filters are selected, show all
    if (selectedFilters.length === 0) return true;

    // Look up the attributes for this card/folder
    const cardAttrs = cardAttributeMap[folderName] || [];

    // If ANY of the selected filters are in the cardAttrs, show it
    console.log(cardAttrs, selectedFilters);
    return cardAttrs.some((attr) => selectedFilters.includes(attr));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h2>
          From Reality to Recognition: Evaluating Visualization Analogies for Novice Chart Comprehension
        </h2>
        <h3>Authors: Oliver Huang, Patrick Lee, Carolina Nobre</h3>
        <h4>EuroVis 2025 Education - Proceedings of the 27th Eurographics Conference on Visualization </h4>
      </header>

      <div className='abstract'>
        <h2>
          Abstract
        </h2>
        <p>Novice learners often have difficulty learning new visualization types because they tend to interpret novel visualizations through
the mental models of simpler charts they have previously encountered. Traditional visualization teaching methods, which usually
rely on directly translating conceptual aspects of data into concrete data visualizations, often fail to attend to the needs of novice
learners navigating this tension. To address this, we systematically explored how analogies can be used to help novices with
chart comprehension. We introduced visualization analogies: visualizations that map data structures to real-world contexts
to facilitate an intuitive understanding of novel chart types. We evaluated this pedagogical technique using a within-subject
study N=128 where we taught 8 novel chart types with visualization analogies. Our findings show that visualization analogies
improve visual analysis skills and help learners transfer their understanding to actual charts. They effectively introduce visual
embellishments, cater to diverse learning preferences, and are preferred by novice learners over traditional chart visualizations.
This study offers theoretical insights and practical tools to advance visualization education through analogical reasoning.</p>
      </div>

      <div className='resources'>
        <h2>Resources</h2>
        <ul>
          <li>
            <a href="https://github.com/hivelabuoft/AnalogyVis" className="source" target="_blank" rel="noopener noreferrer">
              Raw Data & Evaluation Code from User Study
            </a>
          </li>
          <li>
            <a href="https://rotman.az1.qualtrics.com/jfe/form/SV_5aNdezrUixEB0rQ" className="source" target="_blank" rel="noopener noreferrer">
              Qualtrics Survey Questions
            </a>
          </li>
        </ul>
      </div>

    
      {/* Main content */}
      <h2>Visualization Analogies</h2>
      <div className={styles.mainContent}>
        {/* Left side: selection-container */}
        <div className={styles.selectionContainer}>
          {selectionData.map((category, idx) => {
            const folderName = categoryFolderMap[category.title] || '';
            return (
              <div className={styles.selectionItem} key={idx}>
                <h3>{category.title}</h3>
                <div className={styles.buttons}>
                  {category.items.map((item, j) => {
                    // Build the image path
                    const imageUrl = `https://raw.githubusercontent.com/VisAnalogy/visualization-analogies/refs/heads/main/public/${folderName}/${item}.png`;

                    // Check if this filter is active
                    const isActive = selectedFilters.includes(item);

                    const isNeed =
                    category.title !== 'Data-binding type' &&
                    category.title !== 'Analogy strategies';

                    return (
                      <button
                        key={j}
                        className={`${styles.imageButton} ${
                          isActive ? styles.activeFilter : ''
                        } ${isNeed ? styles.need : ''}`}
                        style={{ backgroundImage: `url("${imageUrl}")` }}
                        title={item}
                        onClick={() => handleFilterToggle(item)}
                      >
                        {/* Optionally, show text inside:
                          <span>{item}</span>
                         or keep purely as an image */}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side: analogy-container */}
        <div className={styles.analogyContainer}>
          {analogyFolders.map((folderName, idx) => {
            // For each folder, we show folderNameA.png
            const imageUrl = `https://raw.githubusercontent.com/VisAnalogy/visualization-analogies/refs/heads/main/public/finalQuestionare/${folderName}/${folderName}A.png`;
            // Check if this folder should be visible or hidden
            const visible = isCardVisible(folderName);

            return (
                <Link href={`/${folderName}`} key={folderName} className={`${styles.analogyCard} ${!visible ? styles.hiddenCard : ''}`}>
                    <div
                        key={idx}
                        className={styles.cardImage}
                        style={{ backgroundImage: `url("${imageUrl}")` }}
                    >
                            <div className={styles.cardOverlay}>{folderName}</div>
                    </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
