'use strict';

import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);

import 'chartjs-adapter-date-fns';
import _ from 'lodash';
import * as d3 from "d3";
import data from '../data/output.json';
window.dat = data;

function component() {
    var ctx = "myChart";
    const dataset = data;
    const health_districts = ["Blue Ridge", "Central Shenandoah", "Virginia Beach"];//_.uniq(dataset.map(s => s.vdh_health_district))
    const pal = d3.schemeTableau10;

    const chart_data = {
      labels: dataset.filter( r => r["vdh_health_district"] == "Blue Ridge").map( r => r['report_date']),
      datasets: health_districts.map((s,idx) => ({
        label: s,
        fill: false,
        backgroundColor: pal[idx],
        data: dataset.filter( r=> r.vdh_health_district == s).map( r => r.total_cases_average),
      })),
    };

    const chart_config = {
      type: 'line',
      data: chart_data,
      options: {
        scales: {
          xAxis: {
            type: 'time',
            time: {
              unit: 'week',
            }
          }
        }
      }
    };

    var myChart = new Chart(ctx, chart_config);
}
  
component();