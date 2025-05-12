document.addEventListener("DOMContentLoaded", async () => {
  const ctx = document.getElementById("saveChart").getContext("2d");
  let chart; // lưu biểu đồ

  async function fetchAndRenderChart(view = 'year') {
    try {
      const response = await fetch(`/admin/dashboard/userRegister?view=${view}`);
      const data = await response.json();

      const labels = view === 'month'
        ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
        : data.labels;
      const dataset = view === 'month' ? data.monthlyCounts : data.yearCounts;
      const chartData = {
        labels,
        datasets: [{
          label: view === 'month' ? `Số đăng ký theo từng tháng năm ${data.year}` : "Số đăng ký theo năm",
          data: dataset,
          backgroundColor: "rgba(108, 99, 255, 0.6)",
          borderColor: "rgba(108, 99, 255, 1)",
          borderWidth: 1,
          borderRadius: 5
        }]
      };
        

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Số lượng đăng ký'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Thời gian'
              }
            }
          }
        }
      });
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu biểu đồ:", err);
    }
  }

  // Gọi ban đầu
  fetchAndRenderChart('month');

  // Sự kiện chọn chế độ xem
  document.getElementById("viewSelector").addEventListener("change", function () {
    fetchAndRenderChart(this.value);
  });
});
