import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  BarController,
} from "chart.js";
import { Bar, Chart } from "react-chartjs-2";
import { Account } from "../models/Account";

interface Props {
  account: Account;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

export function CurrentAccountDetails({ account }: Props) {
  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "November",
    "December",
  ];
  const data = {
    labels: labels,
    datasets: [
      {
        type: "bar" as const,
        label: "In",
        data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        type: "bar" as const,
        label: "Out",
        data: [1, 2, 3, 4, 5, 6, 7, 35, 23, 6, 7, 1],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        type: "line" as const,
        label: "Total",
        data: [10, 20, 25, 30, 25, 35, 40, 45, 10, 30, 45],
        backgroundColor: "rgb(9, 121, 105)",
      },
    ],
  };

  return (
    <>
      {/* <Bar
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" as const },
          },
        }}
        data={data}
      /> */}

      <Chart type="bar" data={data} />
    </>
  );
}
