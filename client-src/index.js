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


import data from '../data/output.json';

function component() {
    var ctx = "myChart";
    const dataset = data;
    // 

    const chart_data = {
      labels: dataset.filter( r => r["VDH Health District"] == "Blue Ridge").map( r => r['Report Date']),
      datasets: [{
        label: "Blue Ridge",
        borderColor: 'rgb(75, 192, 192)',
        data: dataset.filter( r => r["VDH Health District"] == "Blue Ridge").map( r => r['Case Average']),
        fill: false,
      }]
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