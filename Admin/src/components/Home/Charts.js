import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Charts = ({ stats }) => {
  // Revenue Pie Chart Data
  const pieData = {
    labels: ["Doanh thu", "Lợi nhuận"],
    datasets: [
      {
        data: [
          stats?.summary?.totalRevenue || 0,
          stats?.summary?.totalProfit || 0,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(75, 192, 192, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Order Status Bar Chart Data
  const barData = {
    labels: Object.keys(stats?.orderStatusCounts || {}).map((status) => {
      const statuses = {
        pending: "Chờ xử lý / COD",
        paid: "Đã thanh toán",
        processing: "Đang chuẩn bị",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancellationRequested: "Yêu cầu hủy",
        cancelled: "Đã hủy",
        returnRequested: "Yêu cầu hoàn",
        returned: "Đã hoàn",
        cancellationRejected: "Từ chối hủy",
        returnRejected: "Từ chối hoàn",
      };
      return statuses[status] || status;
    }),
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: Object.values(stats?.orderStatusCounts || {}),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)", // Xanh dương
          "rgba(75, 192, 192, 0.8)", // Xanh lá
          "rgba(255, 206, 86, 0.8)", // Vàng
          "rgba(153, 102, 255, 0.8)", // Tím
          "rgba(255, 159, 64, 0.8)", // Cam
          "rgba(255, 99, 132, 0.8)", // Hồng
          "rgba(199, 199, 199, 0.8)", // Xám
          "rgba(83, 102, 255, 0.8)", // Xanh tím
          "rgba(255, 159, 164, 0.8)", // Hồng cam
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(83, 102, 255, 1)",
          "rgba(255, 159, 164, 1)",
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        align: "start",
        labels: {
          boxWidth: 10,
          padding: 8,
          font: {
            size: 11,
            family: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: "Biểu đồ thống kê doanh thu và lợi nhuận",
        font: {
          size: 13,
          weight: "bold",
          family: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 5,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${value.toLocaleString("vi-VN")} VND`;
          },
        },
      },
    },
    layout: {
      padding: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ẩn legend vì chỉ có 1 dataset
      },
      title: {
        display: true,
        text: "Biểu đồ thống kê trạng thái đơn hàng",
        font: {
          size: 13,
          weight: "bold",
          family: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 5,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11,
            family: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
            family: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
          },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
    layout: {
      padding: {
        top: 5,
        bottom: 15,
        left: 5,
        right: 5,
      },
    },
  };

  return (
    <div className="charts-container row g-4 mt-2">
      <div className="col-md-6">
        <div className="card h-100 shadow-sm">
          <div
            className="card-body"
            style={{ height: "260px", padding: "0.75rem" }}
          >
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card h-100 shadow-sm">
          <div
            className="card-body"
            style={{ height: "260px", padding: "0.75rem" }}
          >
            <div
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
