document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin page loaded!");

  const container = document.getElementById("appointments-container");

  // 1) Fetch all appointments from your Node server
  //    Adjust URL if needed. If you’re serving Node from localhost:3000:
  fetch("http://localhost:3000/appointments")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      return res.json();
    })
    .then((appointments) => {
      console.log("Appointments:", appointments);
      renderAppointments(appointments);
    })
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      container.innerHTML = "<p>Fehler beim Laden der Termine.</p>";
    });

  function renderAppointments(appointments) {
    if (!appointments || !appointments.length) {
      container.innerHTML = "<p>Keine Termine vorhanden.</p>";
      return;
    }

    container.innerHTML = ""; // clear any placeholder text

    appointments.forEach((appt) => {
      // === Create card element ===
      const card = document.createElement("div");
      card.classList.add("appointment-card");

      // === Determine status badge class (pending, confirmed, canceled) ===
      let statusBadgeClass = "status-pending";
      if (appt.status === "confirmed") statusBadgeClass = "status-confirmed";
      if (appt.status === "canceled") statusBadgeClass = "status-canceled";

      // === Build the appointment info section ===
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("appointment-info");

      // Convert date/time to readable string
      const dateOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };
      let dateStr = "Kein Termin / nicht gewünscht";
      if (appt.appointmentDateTime) {
        dateStr = new Date(appt.appointmentDateTime).toLocaleString("de-DE", dateOptions);
      }

      infoDiv.innerHTML = `
        <span class="status-badge ${statusBadgeClass}">${appt.status}</span>
        <p><strong>Name:</strong> ${appt.name}</p>
        <p><strong>Email:</strong> ${appt.email}</p>
        <p><strong>Nachricht:</strong> ${appt.message || "-"}</p>
        <p class="date-line"><strong>Termin:</strong> ${dateStr}</p>
        <p class="date-line">Erstellt am: ${new Date(appt.createdAt).toLocaleString()}</p>
      `;

      // === Build the actions row ===
      const actionsDiv = document.createElement("div");
      actionsDiv.classList.add("appointment-actions");

      // Confirm button
      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Confirm";
      confirmBtn.classList.add("confirm-btn");
      confirmBtn.addEventListener("click", () => updateAppointmentStatus(appt._id, "confirmed"));

      // Cancel button
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.addEventListener("click", () => updateAppointmentStatus(appt._id, "canceled"));

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", () => deleteAppointment(appt._id));

      // Append all buttons
      actionsDiv.appendChild(confirmBtn);
      actionsDiv.appendChild(cancelBtn);
      actionsDiv.appendChild(deleteBtn);

      // Combine info + actions into the card
      card.appendChild(infoDiv);
      card.appendChild(actionsDiv);

      // Finally, add the card to the grid
      container.appendChild(card);
    });
  }

  // 2) Update status
  function updateAppointmentStatus(id, newStatus) {
    if (!confirm(`Termin wirklich auf "${newStatus}" setzen?`)) return;
    fetch(`http://localhost:3000/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(`Termin auf "${newStatus}" gesetzt.`);
          location.reload();
        } else {
          alert("Fehler beim Aktualisieren des Termin-Status.");
        }
      })
      .catch((err) => {
        console.error("Error updating appointment:", err);
      });
  }

  // 3) Delete
  function deleteAppointment(id) {
    if (!confirm("Diesen Termin wirklich löschen?")) return;
    fetch(`http://localhost:3000/appointments/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Termin erfolgreich gelöscht.");
          location.reload();
        } else {
          alert("Fehler beim Löschen des Termins.");
        }
      })
      .catch((err) => {
        console.error("Error deleting appointment:", err);
      });
  }
});