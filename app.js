const SUPABASE_URL = "https://uhhnclvtdzwazpuqokrc.supabase.co";
const SUPABASE_KEY = "sb_publishable_WrWN8-GIUYgaQweIVzLpKQ_SZCkt_4u";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const joinForm = document.getElementById("joinForm");
const firstNameInput = document.getElementById("firstName");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const loyaltyCard = document.getElementById("loyaltyCard");
const welcomeName = document.getElementById("welcomeName");
const stampCount = document.getElementById("stampCount");
const hearts = document.getElementById("hearts");
const staffButton = document.getElementById("staffButton");

const staffDashboard = document.getElementById("staffDashboard");
const closeStaffDashboard = document.getElementById("closeStaffDashboard");
const customerList = document.getElementById("customerList");
const staffCustomerDetail = document.getElementById("staffCustomerDetail");
const closeCustomerDetail = document.getElementById("closeCustomerDetail");
function showMessage(text) {
  message.textContent = text;
}

function renderHearts(stamps = 0) {
  const safeStamps = Math.max(0, Math.min(10, Number(stamps) || 0));

  hearts.textContent =
    "♥ ".repeat(safeStamps) +
    "♡ ".repeat(10 - safeStamps);

  stampCount.textContent =
    `${safeStamps} / 10 hearts collected`;
}

async function showCustomerCard(user) {
  const { data: customer, error } = await supabaseClient
    .from("customers")
    .select("first_name, stamps, reward_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    showMessage("We couldn't load your loyalty card yet.");
    return;
  }

  let loyaltyCustomer = customer;

  if (!loyaltyCustomer) {
    const firstName =
      user.user_metadata?.first_name ||
      localStorage.getItem("shernzz_first_name") ||
      "Babe";

    const { data, error: insertError } = await supabaseClient
      .from("customers")
      .insert({
        user_id: user.id,
        first_name: firstName,
        stamps: 0,
        email: user.email,
        reward_status: "none"
      })
      .select("first_name, stamps, reward_status, user_id")
      .single();

    if (insertError) {
      console.error(insertError);
      showMessage(
        "Your account is verified, but we couldn't create your loyalty card yet."
      );
      return;
    }

    loyaltyCustomer = data;
  }

  welcomeName.textContent =
    `Hey ${loyaltyCustomer.first_name} 💕`;

  renderHearts(loyaltyCustomer.stamps);

  joinForm.style.display = "none";
  loyaltyCard.classList.remove("hidden");

  showMessage("");
  localStorage.removeItem("shernzz_first_name");
}

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const firstName = firstNameInput.value.trim();
  const email = emailInput.value.trim();

  if (!firstName || !email) {
    return;
  }

  showMessage("Sending your secure sign-in email... 💕");

  localStorage.setItem(
    "shernzz_first_name",
    firstName
  );

  const redirectUrl =
    window.location.origin + window.location.pathname;

  const { error } =
    await supabaseClient.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName
        }
      }
    });

  if (error) {
    console.error(error);
    showMessage(
      "Something went wrong. Please try again."
    );
    return;
  }

  showMessage(
    "Check your email 💌 Tap the secure link to open your loyalty card."
  );
});


const customerSearch = document.getElementById("customerSearch");



staffButton.addEventListener("click", async () => {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    showMessage("Please sign in first 💕");
    return;
  }

  const { data: membership, error } = await supabaseClient
    .from("business_members")
    .select("business_id, role, is_active")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !membership) {
    console.error(error);
    showMessage("You don't have staff access to this dashboard.");
    return;
  }

  loyaltyCard.classList.add("hidden");
  staffDashboard.classList.remove("hidden");
  await loadBusinessCustomers(membership.business_id);
  showMessage("");
});

closeStaffDashboard.addEventListener("click", () => {
  staffDashboard.classList.add("hidden");
  loyaltyCard.classList.remove("hidden");
});

closeCustomerDetail.addEventListener("click", () => {
  staffCustomerDetail.classList.add("hidden");
  closeCustomerDetail.classList.add("hidden");
  customerList.classList.remove("hidden");
});

async function loadBusinessCustomers(businessId) {
  const { data: customers, error } = await supabaseClient
    .from("customers")
    .select("id, first_name, email, stamps, reward_status")
    .eq("business_id", businessId)
    .order("first_name", { ascending: true });

  if (error) {
    console.error(error);
    customerList.innerHTML = "<p>Couldn't load customers yet.</p>";
    return;
  }

  customerList.innerHTML = "";

  if (!customers || customers.length === 0) {
    customerList.innerHTML = "<p>No customers yet 💕</p>";
    return;
  }

  customers.forEach((customer) => {
    const row = document.createElement("div");
    row.className = "customer-row";

    const name = document.createElement("strong");
    name.textContent = customer.first_name || "Customer";

    const details = document.createElement("small");
    details.textContent =
      `${customer.email || "No email"} • ${customer.stamps || 0}/10 hearts`;

    row.appendChild(name);
    row.appendChild(details);
    row.addEventListener("click", () => openCustomerDetail(customer));
    customerList.appendChild(row);
  });
}

function openCustomerDetail(customer) {
  customerList.classList.add("hidden");
  staffCustomerDetail.classList.remove("hidden");
  closeCustomerDetail.classList.remove("hidden");

  const stamps = Math.max(
    0,
    Math.min(10, Number(customer.stamps) || 0)
  );

  staffCustomerDetail.innerHTML = `
    <div class="customer-detail-card">
      <h3>${customer.first_name || "Customer"} 💕</h3>
      <p>${customer.email || "No email"}</p>
      <p><strong>${stamps} / 10 hearts collected</strong></p>
      <div id="staffRewardStatus" class="reward-status"></div>
      <button id="addHeartButton" class="staff-button">+ Add Heart 💕</button>
      <button id="removeHeartButton" class="staff-button">− Remove Heart</button>
    </div>
  `;
  const staffRewardStatus = document.getElementById("staffRewardStatus");
  if (stamps >= 10) {
  staffRewardStatus.textContent = "🎁 Reward unlocked!";
} else if (stamps >= 5) {
  staffRewardStatus.textContent = "🎁 Reward unlocked!";
} else {
  staffRewardStatus.textContent = "";
}

  const addHeartButton = document.getElementById("addHeartButton");

addHeartButton.addEventListener("click", async () => {
  const newStamps = Math.min(10, stamps + 1);

  const { error } = await supabaseClient
    .from("customers")
    .update({ stamps: newStamps })
    .eq("id", customer.id);

  if (error) {
    console.error(error);
    showMessage("Couldn't add the heart. Please try again.");
    return;
  }

  customer.stamps = newStamps;
  openCustomerDetail(customer);
});

  const removeHeartButton = document.getElementById("removeHeartButton");

removeHeartButton.addEventListener("click", async () => {
  const newStamps = Math.max(0, stamps - 1);

  const { error } = await supabaseClient
    .from("customers")
    .update({ stamps: newStamps })
    .eq("id", customer.id);

  if (error) {
    console.error(error);
    showMessage("Couldn't remove the heart. Please try again.");
    return;
  }

  customer.stamps = newStamps;
  openCustomerDetail(customer);
});
}

async function startApp() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    await showCustomerCard(session.user);
  }
}



startApp();
