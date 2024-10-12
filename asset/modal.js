// Get the modal
var modal = document.getElementById("modal");
var modal_change = document.getElementById("modal-change");

// Get the button that opens the modal
var btn = document.querySelector(".btn");
// Get the <span> element that closes the modal
var closeButtons = document.querySelectorAll(".j-close");
// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};
// When the user clicks on <span> (x), close the modal
function closeModal(modalToClose) {
  modalToClose.style.display = "none";
}
// Add event listeners to close buttons
closeButtons.forEach((span) => {
  span.onclick = function () {
    // Determine which modal to close
    if (span.closest("#modal")) {
      closeModal(modal);
    } else if (span.closest("#modal-change")) {
      closeModal(modal_change);
    }
  };
});
// Hàm tạo một hàng mới
function createRow(row) {
  const tr = document.createElement("tr");

  // Thêm thuộc tính ID cho hàng
  tr.id = row.id; // Giả sử ID có trong dữ liệu từ API

  const userTd = document.createElement("td");
  userTd.textContent = row.user;
  tr.appendChild(userTd);

  const emailTd = document.createElement("td");
  emailTd.textContent = row.email;
  tr.appendChild(emailTd);

  const passwordTd = document.createElement("td");
  passwordTd.textContent = row.password;
  tr.appendChild(passwordTd);

  const dateTd = document.createElement("td");
  dateTd.textContent = row.date;
  tr.appendChild(dateTd);

  // Thêm trường status với giá trị mặc định là "Active"
  const statusTd = document.createElement("td");
  const statusSpan = document.createElement("span");
  statusSpan.textContent = "Active"; // Hiển thị giá trị mặc định "Active"
  statusSpan.classList.add("status", "active"); // Thêm lớp CSS cho trạng thái "Active"
  statusTd.appendChild(statusSpan);
  tr.appendChild(statusTd);

  const editTd = document.createElement("td");
  const editSpan = document.createElement("span");
  editSpan.classList.add("edit-u", "form-e-d");
  editSpan.innerHTML = '<ion-icon name="create-outline"></ion-icon>';

  const deleteSpan = document.createElement("span");
  deleteSpan.classList.add("del-u", "form-e-d");
  deleteSpan.innerHTML = '<ion-icon name="remove-circle-outline"></ion-icon>';
  deleteSpan.addEventListener("click", () => {
    const rowElement = deleteSpan.closest("tr");
    const userId = rowElement.id; // Lấy id từ thuộc tính của hàng

    // Gửi yêu cầu DELETE đến API để xoá dữ liệu
    $.ajax({
      // url: `https://66b07a1e6a693a95b538d9ef.mockapi.io/info-user/${userId}`, // Thay thế bằng URL của API
      url: "https://" + HOST + END_POINT_CUSTOMER + userId,
      method: "DELETE",
      success: function () {
        // Xoá hàng khỏi bảng
        rowElement.remove();
      },
      error: function (xhr, status, error) {
        console.error("Có lỗi xảy ra: " + error);
      },
    });
  });

  editSpan.addEventListener("click", () => {
    // Populate the form with current data
    document.querySelector("#change-form #username").value = row.user;
    document.querySelector("#change-form #email").value = row.email;
    document.querySelector("#change-form #password").value = row.password;
    currentEditingId = row.id; // Store the id of the row being edited

    // Show the modal
    modal_change.style.display = "block";
  });

  editTd.appendChild(editSpan);
  editTd.appendChild(deleteSpan);
  tr.appendChild(editTd);

  return tr;
}

$(document).ready(function () {
  $.ajax({
    url: "https://66b07a1e6a693a95b538d9ef.mockapi.io/info-user",
    method: "GET",
    dataType: "json",
    success: function (data) {
      const tableBody = $("#user-table tbody");
      tableBody.empty(); // Xóa nội dung cũ

      // Thêm các hàng vào bảng
      data.forEach((row) => {
        const tr = createRow(row);
        tableBody.append(tr);
      });
    },
    error: function (xhr, status, error) {
      console.error("Có lỗi xảy ra: " + error);
    },
  });
});

// Xử lý sự kiện tạo hàng mới
const registerForm = document.querySelector("#add-form");
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // Lấy ngày tháng năm hiện tại ở dạng "DD/MM/YYYY"

  const newRow = {
    user: username,
    email: email,
    password: password,
    date: currentDate,
  };

  // Gửi yêu cầu POST đến API
  $.ajax({
    url: "https://66b07a1e6a693a95b538d9ef.mockapi.io/info-user",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(newRow),
    success: function (data) {
      const tr = createRow(data); // `data` từ API sẽ có id và các trường khác
      const tableBody = $("#user-table tbody");
      tableBody.append(tr);
      registerForm.reset();
      document.querySelector("#modal").style.display = "none";
    },
    error: function (xhr, status, error) {
      console.error("Có lỗi xảy ra: " + error);
    },
  });
});

const updateForm = document.querySelector("#change-form");
let currentEditingId = null; // Variable to store the id of the row being edited

updateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#change-form #username").value;
  const email = document.querySelector("#change-form #email").value;
  const password = document.querySelector("#change-form #password").value;

  const updatedRow = {
    user: username,
    email: email,
    password: password,
  };

  // Gửi yêu cầu PUT đến API để cập nhật dữ liệu
  $.ajax({
    url: `https://${HOST}${END_POINT_CUSTOMER}/${currentEditingId}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(updatedRow),
    success: function (data) {
      const rowElement = document.getElementById(currentEditingId);
      rowElement.children[0].textContent = data.user;
      rowElement.children[1].textContent = data.email;
      rowElement.children[2].textContent = data.password;

      closeModal(modal_change); // Close the edit modal
      updateForm.reset();
      currentEditingId = null; // Reset the current editing ID
    },
    error: function (xhr, status, error) {
      console.error("Có lỗi xảy ra: " + error);
    },
  });
});
