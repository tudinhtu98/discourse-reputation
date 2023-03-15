import Report from "../models/report";
import Component from "@ember/component";
import discourseDebounce from "discourse-common/lib/debounce";
import loadScript from "discourse/lib/load-script";
import { makeArray } from "discourse-common/lib/helpers";
import { number } from "discourse/lib/formatter";
import { schedule } from "@ember/runloop";
import { bind } from "discourse-common/utils/decorators";

export default Component.extend({
  classNames: ["admin-report-chart"],
  limit: 8,
  total: 0,
  options: null,

  didInsertElement() {
    this._super(...arguments);

    window.addEventListener("resize", this._resizeHandler);
  },

  willDestroyElement() {
    this._super(...arguments);

    window.removeEventListener("resize", this._resizeHandler);

    this._resetChart();
  },

  didReceiveAttrs() {
    this._super(...arguments);

    discourseDebounce(this, this._scheduleChartRendering, 100);
  },

  _scheduleChartRendering() {
    schedule("afterRender", () => {
      this._renderChart(
        this.model,
        this.element && this.element.querySelector(".chart-canvas")
      );
    });
  },

  _renderChart(model, chartCanvas) {
    if (!chartCanvas) {
      return;
    }

    const context = chartCanvas.getContext("2d");
    const chartData = this._applyChartGrouping(
      model,
      makeArray(model.get("chartData") || model.get("data"), "weekly"),
      this.options
    );
    const prevChartData = makeArray(
      model.get("prevChartData") || model.get("prev_data")
    );

    const labels = chartData.map((d) => d.x);

    const data = {
      labels,
      datasets: [
        {
          data: chartData.map((d) => Math.round(parseFloat(d.y))),
          backgroundColor: prevChartData.length
            ? "transparent"
            : model.secondary_color,
          borderColor: model.primary_color,
          pointRadius: 3,
          borderWidth: 1,
          pointBackgroundColor: model.primary_color,
          pointBorderColor: model.primary_color,
        },
      ],
    };

    if (prevChartData.length) {
      data.datasets.push({
        data: prevChartData.map((d) => Math.round(parseFloat(d.y))),
        borderColor: model.primary_color,
        borderDash: [5, 5],
        backgroundColor: "transparent",
        borderWidth: 1,
        pointRadius: 0,
      });
    }

    loadScript("/javascripts/Chart.min.js").then(() => {
      this._resetChart();

      if (!this.element) {
        return;
      }

      this._chart = new window.Chart(
        context,
        this._buildChartConfig(data, this.options)
      );
    });
  },

  _buildChartConfig(data, options) {
    return {
      type: "line",
      data,
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title: (tooltipItem) =>
                moment(tooltipItem[0].label, "YYYY-MM-DD").format("LL"),
            },
          },
          legend: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        responsiveAnimationDuration: 0,
        animation: {
          duration: 0,
        },
        layout: {
          padding: {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          },
        },
        scales: {
          y: [
            {
              display: true,
              ticks: {
                callback: (label) => number(label),
                sampleSize: 5,
                maxRotation: 25,
                minRotation: 25,
              },
            },
          ],
          x: [
            {
              display: true,
              gridLines: { display: false },
              type: "time",
              time: {
                unit: Report.unitForGrouping(options.chartGrouping),
              },
              ticks: {
                sampleSize: 5,
                maxRotation: 50,
                minRotation: 50,
              },
            },
          ],
        },
      },
    };
  },

  _resetChart() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = null;
    }
  },

  collapseWithoutSumValue(model, data, grouping) {
    grouping = grouping || Report.groupingForDatapoints(data.length);

    if (grouping === "daily") {
      return data;
    } else if (grouping === "weekly" || grouping === "monthly") {
      const isoKind = grouping === "weekly" ? "isoWeek" : "month";
      const kind = grouping === "weekly" ? "week" : "month";
      const startMoment = moment(model.start_date, "YYYY-MM-DD");

      let currentIndex = 0;
      let currentStart = startMoment.clone().startOf(isoKind);
      let currentEnd = startMoment.clone().endOf(isoKind);
      const transformedData = [
        {
          x: currentStart.format("YYYY-MM-DD"),
          y: 0,
        },
      ];

      let appliedAverage = false;
      data.forEach((d) => {
        const date = moment(d.x, "YYYY-MM-DD");

        if (
          !date.isSame(currentStart) &&
          !date.isBetween(currentStart, currentEnd)
        ) {
          if (model.average) {
            transformedData[currentIndex].y = applyAverage(
              transformedData[currentIndex].y,
              currentStart,
              currentEnd
            );

            appliedAverage = true;
          }

          currentIndex += 1;
          currentStart = currentStart.add(1, kind).startOf(isoKind);
          currentEnd = currentEnd.add(1, kind).endOf(isoKind);
        } else {
          appliedAverage = false;
        }

        if (transformedData[currentIndex]) {
          transformedData[currentIndex].y = d.y;
        } else {
          transformedData[currentIndex] = {
            x: d.x,
            y: d.y,
          };
        }
      });

      if (model.average && !appliedAverage) {
        transformedData[currentIndex].y = applyAverage(
          transformedData[currentIndex].y,
          currentStart,
          moment(model.end_date).subtract(1, "day") // remove 1 day as model end date is at 00:00 of next day
        );
      }

      return transformedData;
    }

    // ensure we return something if grouping is unknown
    return data;
  },

  _applyChartGrouping(model, data, options) {
    return this.collapseWithoutSumValue(model, data, options.chartGrouping);
  },

  @bind
  _resizeHandler() {
    discourseDebounce(this, this._scheduleChartRendering, 500);
  },
});
