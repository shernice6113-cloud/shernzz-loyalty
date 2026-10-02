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
    .select("id, first_name, email, stamps, reward_status, business_id")
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

async function recordActivity(customer, activityType, description) {
  const { error } = await supabaseClient
    .from("activity_history")
    .insert({
      customer_id: customer.id,
      business_id: customer.business_id,
      activity_type: activityType,
      description: description
    });

  if (error) {
    console.error("Could not record activity:", error);
  }
}

async function loadCustomerHistory(customer) {
  const { data: history, error } = await supabaseClient
    .from("activity_history")
    .select("id, activity_type, description, created_at")
    .eq("customer_id", customer.id)
    .eq("business_id", customer.business_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load customer history:", error);
    return "<p>Couldn't load history.</p>";
  }

  if (!history || history.length === 0) {
    return "<p>No activity yet.</p>";
  }

  return history.map((item) => {
    const date = new Date(item.created_at);

    return `
      <div class="history-item">
        <div>
          <strong>${item.description}</strong>
          <small>${date.toLocaleString()}</small>
        </div>
      </div>
    `;
  }).join("");
}

async function openCustomerDetail(customer) {
  customerList.classList.add("hidden");
  staffCustomerDetail.classList.remove("hidden");
  closeCustomerDetail.classList.remove("hidden");

  const stamps = Math.max(
    0,
    Math.min(10, Number(customer.stamps) || 0)
  );

  const { data: business, error: businessError } = await supabaseClient
  .from("businesses")
  .select("reward_5, reward_10")
  .eq("id", customer.business_id)
  .single();
  if (businessError) {
  console.error("Could not load business rewards:", businessError);
}

  const historyHtml = await loadCustomerHistory(customer);
  staffCustomerDetail.innerHTML = `
    <div class="customer-detail-card">
      <h3>${customer.first_name || "Customer"} 💕</h3>
      <p>${customer.email || "No email"}</p>
      <p><strong>${stamps} / 10 hearts collected</strong></p>
      <div id="staffRewardStatus" class="reward-status"></div>
      <button id="addHeartButton" class="staff-button">+ Add Heart 💕</button>
      <button id="removeHeartButton" class="staff-button">− Remove Heart</button>
      <div class="customer-history">
  <h3>History</h3>
  ${historyHtml}
</div>
    </div>
  `;
  const staffRewardStatus = document.getElementById("staffRewardStatus");
 if (
  (stamps >= 10 && customer.reward_status === "reward_10_redeemed") ||
  (stamps >= 5 &&
    stamps < 10 &&
    customer.reward_status === "reward_5_redeemed")
) {
  const redeemedReward =
    stamps >= 10 ? business?.reward_10 : business?.reward_5;

  staffRewardStatus.textContent = `✓ Redeemed: ${redeemedReward || "Reward"}`;
} else
  if (stamps >= 10 && business?.reward_10) {
  staffRewardStatus.textContent = `🎁 Reward unlocked: ${business.reward_10}`;
    staffRewardStatus.insertAdjacentHTML(
  "beforeend",
  '<br><button type="button" id="redeemRewardButton" class="staff-button">Redeem Reward ✓</button>'
);
} else if (stamps >= 5 && business?.reward_5) {
  staffRewardStatus.textContent = `🎁 Reward unlocked: ${business.reward_5}`;
    staffRewardStatus.insertAdjacentHTML(
  "beforeend",
  '<br><button type="button" id="redeemRewardButton" class="staff-button">Redeem Reward ✓</button>'
);
} else {
  staffRewardStatus.textContent = "";
}

  const redeemRewardButton = document.getElementById("redeemRewardButton");
  if (redeemRewardButton) {
    redeemRewardButton.addEventListener("click", async () => {
      const rewardUsed =
  stamps >= 10 ? business?.reward_10 : business?.reward_5;
      const { error: redeemError } = await supabaseClient
  .from("customers")
  .update({
  reward_status: stamps >= 10 ? "reward_10_redeemed" : "reward_5_redeemed"
})
  .eq("id", customer.id);
      if (redeemError) {
  console.error(redeemError);
  showMessage("Couldn't redeem the reward. Please try again.");
  return;
}
      customer.reward_status =
  stamps >= 10 ? "reward_10_redeemed" : "reward_5_redeemed";

      await recordActivity(
  customer,
  "reward_redeemed",
  `${rewardUsed} redeemed`
);
      staffRewardStatus.textContent = `✓ Redeemed: ${rewardUsed}`;
      });
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
  
  await recordActivity(
  customer,
  "heart_added",
  `Heart added — ${newStamps}/10`
);
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

  await recordActivity(
  customer,
  "heart_removed",
  `Heart removed — ${newStamps}/10`
);
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
