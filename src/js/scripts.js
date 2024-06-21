// Add this to your JavaScript file, e.g., scripts.js
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("intro-modal");
  const closeModal = document.getElementById("close-modal");
  // const exitModal = document.getElementById("exit-modal");
  const playModal = document.getElementById("change-text-button");

  // Show the modal when the page loads
  setTimeout(() => {
    modal.classList.add("show");
  }, 500); // 延迟0.5秒后显示

  // Hide the modal when the close button is clicked
  closeModal.addEventListener("click", function () {
    modal.classList.remove("show");
  });

  // Optional: Hide the modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.remove("show");
    }
  });

  // exitModal.addEventListener("click", function (event) {
  //   window.close();
  // })

  playModal.addEventListener('click', function() {
    // console.log(playModal.textContent);
    if (playModal.textContent === '点错了，并不想了解你... Bye') {
      playModal.textContent = '你确定吗？';
    } else if (playModal.textContent === '你确定吗？') {
      playModal.textContent = '再想想吧';
    } else if (playModal.textContent === '再想想吧') {
      playModal.textContent = '用不了多久的';
    } else if (playModal.textContent === '用不了多久的') {
      playModal.textContent = '好吧...再见';
    } else if (playModal.textContent === '好吧...再见') {
      playModal.textContent = '如果你真得想退出，点右上角的叉号不久好了...所以你还想再看看？';
    } else if (playModal.textContent === '如果你真得想退出，点右上角的叉号不久好了...所以你还想再看看？') {
      playModal.textContent = '满足你！！';
      // Show the modal when the page loads
      setTimeout(() => {
        modal.classList.remove("show");
      }, 800); // 延迟0.8秒后显示
    } else {
      playModal.textContent = '你确定吗？';
    }
  });
});
