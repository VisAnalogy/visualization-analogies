// pages/[chartName].js

import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react'; // <-- Using Monaco Editor
import styles from '../styles/ChartDetail.module.css';
import { RiResetRightLine } from "react-icons/ri";

export async function getStaticProps({ params }) {
    const { chartName } = params;
  
    // 1. Load JSON data for the chart (already in your code)
    const jsonPath = path.join(process.cwd(), 'public', 'data', `${chartName}.json`);
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const chartData = JSON.parse(jsonContent);
  
    // 2. Load the corresponding HTML file (e.g. Waterfall.html)
    let descriptionHTML = '';
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'description', `${chartName}.html`);
      descriptionHTML = fs.readFileSync(htmlPath, 'utf-8');
    } catch (err) {
      // If there's no HTML file, or another read error:
      descriptionHTML = '<p>No description available.</p>';
    }
  
    return {
      props: {
        chartName,
        chartData,
        descriptionHTML, // pass the raw HTML string
      },
    };
  }
  

  export async function getStaticPaths() {
    // Find all .json files in public/data/
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const files = fs.readdirSync(dataDir);
  
    // Example: ['waterfall.json', 'barChart.json']
    const chartNames = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  
    const paths = chartNames.map((chartName) => ({
      params: { chartName },
    }));
  
    return {
      paths,
      fallback: false,
    };
  }

export default function ChartDetail({ chartName, chartData, descriptionHTML }) {
  // Build GitHub raw URLs for the images
  const imageAUrl = `https://raw.githubusercontent.com/VisAnalogy/visualization-analogies/refs/heads/main/public/finalQuestionare/${chartName}/${chartName}A.png`;
  const imageCUrl = `https://raw.githubusercontent.com/VisAnalogy/visualization-analogies/refs/heads/main/public/finalQuestionare/${chartName}/${chartName}C.png`;

  // Stringify JSON for the Monaco Editor
  const jsonString = JSON.stringify(chartData, null, 2);

  return (
    <div className={styles.pageContainer}>
      {/* 10vh Header */}
      <header className={styles.header}>
        <h1>{chartName}</h1>
      </header>

      {/* Main Content (90vh) */}
      <div className={styles.mainContent}>
        <div className={styles.descriptionPanel}>
          <h3>Analogy Description</h3>
          <div
            className={styles.descriptionContent}
            dangerouslySetInnerHTML={{ __html: descriptionHTML }}
          />
        </div>

        {/* Left side (40%): Monaco Editor (read-only) */}
        <div className={styles.jsonPanel}>
          <h3>Chart Data (Read-Only)</h3>
          <div className={styles.jsonScroll}>
            <Editor
              height="100%"
              defaultLanguage="json"
              value={jsonString}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Right side (60%): Two images stacked vertically */}
        <div className={styles.imagePanel}>
          <div className={styles.imageWrapper}>
            <h2>Visualization Analogy</h2>
            <ZoomableImage src={imageAUrl} alt={`${chartName} A`} />
          </div>

          <div className={styles.imageWrapper}>
            <h2>Actual Chart</h2>
            <ZoomableImage src={imageCUrl} alt={`${chartName} C`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ZoomableImage - supports pan/zoom with mouse and wheel
 */
function ZoomableImage({ src, alt }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1); // Initial scale
    const [scaleToFitHeight, setScaleToFitHeight] = useState(1); // Initial scale
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
    // Calculate dynamic scale when the component mounts or resizes
    useEffect(() => {
      const updateScale = () => {
        if (containerRef.current) {
          const containerHeight = window.innerHeight * 0.4 - parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.7;
  
          const img = new Image();
          img.src = src;
          img.onload = () => {
            const naturalHeight = img.naturalHeight;
            const scaleToFitHeight = containerHeight / naturalHeight;
            setScaleToFitHeight(scaleToFitHeight);
            setScale(scaleToFitHeight);
          };
        }
      };
  
      updateScale();
      window.addEventListener('resize', updateScale);
  
      return () => window.removeEventListener('resize', updateScale);
    }, [src]);
  
    // Zoom in/out with mouse wheel
    const onWheel = (e) => {
      e.preventDefault();
      const zoomAmount = -e.deltaY * 0.001;
      setScale((prev) => Math.max(0.1, prev + zoomAmount));
    };
  
    // Start dragging
    const onMouseDown = (e) => {
      e.preventDefault();
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    };
  
    // Dragging in progress
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setLastPos({ x: e.clientX, y: e.clientY });
      setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    };
  
    // End dragging
    const onMouseUp = () => {
      setIsDragging(false);
    };
  
    // Manual zoom in
    const zoomIn = () => {
      setScale((prev) => Math.min(prev + 0.1, 5)); // Limit max zoom level
    };
  
    // Manual zoom out
    const zoomOut = () => {
      setScale((prev) => Math.max(prev - 0.1, 0.1)); // Limit min zoom level
    };

    const reset = () => {
        setScale(scaleToFitHeight);
    };
  
    return (
      <div
        ref={containerRef}
        className={styles.zoomableImageContainer}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <img
          src={src}
          alt={alt}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        />
  
        {/* Zoom Controls */}
        <div className={styles.zoomControls}>
        <button className={styles.zoomButton} onClick={reset}>
            <RiResetRightLine />
          </button>
          <button className={styles.zoomButton} onClick={zoomIn}>
            +
          </button>
          <button className={styles.zoomButton} onClick={zoomOut}>
            −
          </button>
        </div>
      </div>
    );
  }
