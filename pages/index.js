// pages/index.js

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
  Waterfall: ['Flow', 'Part-to-Whole'],
  BarChart: ['Deviation', 'Magnitude'],
  Histogram: ['Distribution'],
  StackedArea: ['Temporal', 'Part-to-Whole'],
  Sunburst: ['Part-to-Whole', 'Comparison'],
  Treemap: ['Part-to-Whole', 'Comparison'],
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
    return cardAttrs.some((attr) => selectedFilters.includes(attr));
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Visualization Analogy</h1>
        <h2>
          From Reality to Recognition: Evaluating Visualization Analogies
          <br />
          for Novice Chart Comprehension
        </h2>
      </header>

      {/* Main content */}
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
                    const imageUrl = `/${folderName}/${item}.png`;

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
            const imageUrl = `/finalQuestionare/${folderName}/${folderName}A.png`;
            // Check if this folder should be visible or hidden
            const visible = isCardVisible(folderName);

            return (
              <div
                className={`${styles.analogyCard} ${!visible ? styles.hiddenCard : ''}`}
                key={idx}
              >
                <div
                  className={styles.cardImage}
                  style={{ backgroundImage: `url("${imageUrl}")` }}
                >
                  <div className={styles.cardOverlay}>{folderName}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
