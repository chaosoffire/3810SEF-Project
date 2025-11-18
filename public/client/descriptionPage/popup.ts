const popup = document.getElementById("popup-container") as HTMLElement | null;
const closeBtn = document.getElementById("close-btn") as HTMLButtonElement | null;

function showPopup(): void {
  if (popup) {
    popup.classList.add("active");
  }
}

(window as any).showPopup = showPopup;

function closePopup(): void {
  if (popup) {
    popup.classList.remove("active");
  }
}

if (closeBtn) {
  closeBtn.addEventListener("click", closePopup);
}