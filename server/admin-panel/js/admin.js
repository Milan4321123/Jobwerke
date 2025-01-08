document.addEventListener("DOMContentLoaded", () => {
  const appointmentsContainer = document.getElementById("appointments-container");
  const subscribersContainer = document.getElementById("subscribers-container");

  const btnAppointments = document.getElementById("btnAppointments");
  const btnSubscribers = document.getElementById("btnSubscribers");

  const sectionAppointments = document.getElementById("appointments-section");
  const sectionSubscribers = document.getElementById("subscribers-section");

  // ========================================================
  // TAB SWITCH LOGIC
  // ========================================================
  btnAppointments.addEventListener("click", () => {
    // Show appointments, hide subscribers
    sectionAppointments.style.display = "block";
    sectionSubscribers.style.display = "none";
    btnAppointments.classList.add("active");
    btnSubscribers.classList.remove("active");
  });

  btnSubscribers.addEventListener("click", () => {
    // Show subscribers, hide appointments
    sectionAppointments.style.display = "none";
    sectionSubscribers.style.display = "block";
    btnAppointments.classList.remove("active");
    btnSubscribers.classList.add("active");
  });

  // ========================================================
  // 1) FETCH APPOINTMENTS
  // ========================================================
  fetch("http://localhost:3000/appointments")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      return res.json();
    })
    .then(appointments => {
      renderAppointments(appointments);
    })
    .catch(err => {
      console.error("Error fetching appointments:", err);
      appointmentsContainer.innerHTML = "<p>Fehler beim Laden der Termine.</p>";
    });

  function renderAppointments(appointments) {
    if (!appointments || appointments.length === 0) {
      appointmentsContainer.innerHTML = "<p>Keine Termine vorhanden.</p>";
      return;
    }

    appointmentsContainer.innerHTML = ""; // clear placeholder

    appointments.forEach(appt => {
      // Card wrapper
      const card = document.createElement("div");
      card.classList.add("appointment-card");

      // Status badge
      let statusBadgeClass = "status-pending";
      if (appt.status === "confirmed") statusBadgeClass = "status-confirmed";
      if (appt.status === "canceled") statusBadgeClass = "status-canceled";

      // Convert date
      let dateStr = "Kein Termin / nur Nachricht";
      if (appt.appointmentDateTime) {
        const d = new Date(appt.appointmentDateTime);
        dateStr = d.toLocaleString("de-DE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      // Info
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("appointment-info");
      infoDiv.innerHTML = `
        <span class="status-badge ${statusBadgeClass}">${appt.status}</span>
        <p><strong>Name:</strong> ${appt.name}</p>
        <p><strong>Email:</strong> ${appt.email}</p>
        <p><strong>Nachricht:</strong> ${appt.message || "-"}</p>
        <p><strong>Termin:</strong> ${dateStr}</p>
        <p>Erstellt am: ${new Date(appt.createdAt).toLocaleString()}</p>
      `;

      // Actions
      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("appointment-actions");

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Confirm";
      confirmBtn.classList.add("confirm-btn");
      confirmBtn.addEventListener("click", () => updateStatus(appt._id, "confirmed"));

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.addEventListener("click", () => updateStatus(appt._id, "canceled"));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", () => deleteAppointment(appt._id));

      actionsDiv.appendChild(confirmBtn);
      actionsDiv.appendChild(cancelBtn);
      actionsDiv.appendChild(deleteBtn);

      card.appendChild(infoDiv);
      card.appendChild(actionsDiv);
      appointmentsContainer.appendChild(card);
    });
  }

  function updateStatus(id, newStatus) {
    if (!confirm(`Termin wirklich auf "${newStatus}" setzen?`)) return;

    fetch(`http://localhost:3000/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`Termin auf "${newStatus}" gesetzt.`);
          location.reload();
        } else {
          alert("Fehler beim Aktualisieren des Termin-Status.");
        }
      })
      .catch(err => {
        console.error("Error updating status:", err);
      });
  }

  function deleteAppointment(id) {
    if (!confirm("Diesen Termin wirklich löschen?")) return;

    fetch(`http://localhost:3000/appointments/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Termin erfolgreich gelöscht.");
          location.reload();
        } else {
          alert("Fehler beim Löschen des Termins.");
        }
      })
      .catch(err => {
        console.error("Error deleting appointment:", err);
      });
  }

  // ========================================================
  // 2) FETCH SUBSCRIBERS
  // ========================================================
  fetch("http://localhost:3000/subscribers")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      return res.json();
    })
    .then(subscribers => {
      renderSubscribers(subscribers);
    })
    .catch(err => {
      console.error("Error fetching subscribers:", err);
      subscribersContainer.innerHTML = "<p>Fehler beim Laden der Abonnenten.</p>";
    });

  function renderSubscribers(subscribers) {
    if (!subscribers || subscribers.length === 0) {
      subscribersContainer.innerHTML = "<p>Keine Abonnenten vorhanden.</p>";
      return;
    }

    subscribersContainer.innerHTML = ""; // clear placeholder

    subscribers.forEach(sub => {
      // A simple card or row for each subscriber
      const subCard = document.createElement("div");
      subCard.classList.add("subscriber-card");

      const infoDiv = document.createElement("div");
      infoDiv.classList.add("subscriber-info");
      infoDiv.innerHTML = `
        <p><strong>Email:</strong> ${sub.email}</p>
        <p>Erstellt am: ${new Date(sub.createdAt).toLocaleString()}</p>
      `;

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", () => deleteSubscriber(sub._id));

      subCard.appendChild(infoDiv);
      subCard.appendChild(deleteBtn);
      subscribersContainer.appendChild(subCard);
    });
  }

  function deleteSubscriber(id) {
    if (!confirm("Diesen Abonnenten wirklich löschen?")) return;

    fetch(`http://localhost:3000/subscribers/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Abonnent erfolgreich gelöscht.");
          location.reload();
        } else {
          alert("Fehler beim Löschen des Abonnenten.");
        }
      })
      .catch(err => {
        console.error("Error deleting subscriber:", err);
      });
  }
});