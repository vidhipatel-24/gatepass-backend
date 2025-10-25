const API = "http://localhost:3000/api";

const studentSec = document.getElementById("student");
const modSec = document.getElementById("moderator");
const gateSec = document.getElementById("gate");

document.getElementById("btn-student").onclick = () => show("student");
document.getElementById("btn-moderator").onclick = () => show("moderator");
document.getElementById("btn-gate").onclick = () => show("gate");

function show(role) {
  studentSec.classList.add("hidden");
  modSec.classList.add("hidden");
  gateSec.classList.add("hidden");

  document.getElementById("btn-student").classList.remove("active");
  document.getElementById("btn-moderator").classList.remove("active");
  document.getElementById("btn-gate").classList.remove("active");

  document.getElementById(`btn-${role}`).classList.add("active");
  document.getElementById(role).classList.remove("hidden");

  if (role === "moderator") loadPending();
}

// Student Form
document.getElementById("requestForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const body = {
    name: form.get("name"),
    roll: form.get("roll"),
    reason: form.get("reason"),
  };
  const res = await fetch(`${API}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  alert(`Request Submitted! ID: ${data.id}`);
};

// Moderator
async function loadPending() {
  const res = await fetch(`${API}/requests?status=pending`);
  const list = await res.json();
  const container = document.getElementById("pendingList");
  container.innerHTML = list.length
    ? list.map(r => `
      <div>
        <strong>${r.name}</strong> (${r.roll}) — ${r.reason}<br>
        <button onclick="updateStatus('${r.id}','approved')">Approve</button>
        <button onclick="updateStatus('${r.id}','rejected')">Reject</button>
      </div>
    `).join("<hr>")
    : "No pending requests.";
}

async function updateStatus(id, status) {
  const remarks = prompt("Remarks?");
  await fetch(`${API}/requests/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, remarks }),
  });
  alert("Updated!");
  loadPending();
}

// Gate Keeper
document.getElementById("scanForm").onsubmit = async (e) => {
  e.preventDefault();
  const id = new FormData(e.target).get("id");
  const res = await fetch(`${API}/requests/${id}/scan`, { method: "POST" });
  const data = await res.json();
  document.getElementById("scanResult").innerText = JSON.stringify(data, null, 2);
};
