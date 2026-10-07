const SUPABASE_URL = "https://uhhnclvtdzwazpuqokrc.supabase.co";
const SUPABASE_KEY = "sb_publishable_WrWN8-GIUYgaQweIVzLpKQ_SZCkt_4u";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const joinCard = document.querySelector(".join-card");
const joinForm = document.getElementById("joinForm");
const firstNameInput = document.getElementById("firstName");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const loyaltyCard = document.getElementById("loyaltyCard");
const welcomeName = document.getElementById("welcomeName");
const stampCount = document.getElementById("stampCount");
const hearts = document.getElementById("hearts");
const staffButton = document.getElementById("staffButton");
const accountHome =
  document.getElementById("accountHome");
const createBusinessButton =
  document.getElementById("createBusinessButton");

const createBusinessPage =
  document.getElementById("createBusinessPage");

const cancelCreateBusinessButton =
  document.getElementById("cancelCreateBusinessButton");

const saveBusinessButton =
  document.getElementById("saveBusinessButton");
const newBusinessName =
  document.getElementById("newBusinessName");

const newReward5 =
  document.getElementById("newReward5");

const newReward10 =
  document.getElementById("newReward10");
const businessAccountList =
  document.getElementById("businessAccountList");

const loyaltyAccountList =
  document.getElementById("loyaltyAccountList");
const customerHome = document.querySelector(".customer-home");
const customerRewardsPage =
  document.getElementById("customerRewardsPage");

const rewardsNavButton =
  document.getElementById("rewardsNavButton");
const nextRewardCard =
  document.querySelector(".next-reward-card");
const rewardsBackButton =
  document.getElementById("rewardsBackButton");
const historyNavButton =
  document.getElementById("historyNavButton");

const customerHistoryPage =
  document.getElementById("customerHistoryPage");

const historyBackButton =
  document.getElementById("historyBackButton");
const profileNavButton =
  document.getElementById("profileNavButton");

const customerProfilePage =
  document.getElementById("customerProfilePage");

const profileBackButton =
  document.getElementById("profileBackButton");

const signOutButton =
  document.getElementById("signOutButton");

const profileName =
  document.getElementById("profileName");

const profileEmail =
  document.getElementById("profileEmail");

const profileMemberSince =
  document.getElementById("profileMemberSince");

const customerHistoryList =
  document.getElementById("customerHistoryList");
const staffCustomerControls =
  document.getElementById("staffCustomerControls");
const reward5Card =
  document.getElementById("reward5Card");

const reward10Card =
  document.getElementById("reward10Card");

const reward5Status =
  document.getElementById("reward5Status");

const reward10Status =
  document.getElementById("reward10Status");

const reward5Message =
  document.getElementById("reward5Message");

const reward10Message =
  document.getElementById("reward10Message");

const staffDashboard = document.getElementById("staffDashboard");
const staffBusinessName =
  document.getElementById("staffBusinessName");
const closeStaffDashboard = document.getElementById("closeStaffDashboard");
const customerList = document.getElementById("customerList");
const staffRecentActivity =
  document.getElementById("staffRecentActivity");
const staffCustomerDetail = document.getElementById("staffCustomerDetail");
const closeCustomerDetail = document.getElementById("closeCustomerDetail");
function showMessage(text) {
  message.textContent = text;
}

function renderHearts(stamps = 0) {
  const safeStamps = Math.max(
    0,
    Math.min(10, Number(stamps) || 0)
  );

  hearts.innerHTML =
  "♥ ".repeat(Math.min(safeStamps, 5)) +
  "♡ ".repeat(5 - Math.min(safeStamps, 5)) +
  "<br>" +
  "♥ ".repeat(Math.max(0, safeStamps - 5)) +
  "♡ ".repeat(5 - Math.max(0, safeStamps - 5));
  stampCount.textContent =
    `${safeStamps} / 10 orders`;

  const nextRewardText =
    document.getElementById("nextRewardText");

  if (!nextRewardText) {
    return;
  }

  if (safeStamps < 5) {
    const remaining = 5 - safeStamps;

    nextRewardText.textContent =
      `${remaining} more ${remaining === 1 ? "order" : "orders"} → 25% OFF`;
  } else if (safeStamps < 10) {
    const remaining = 10 - safeStamps;

    nextRewardText.textContent =
      `${remaining} more ${remaining === 1 ? "order" : "orders"} → 50% OFF`;
  } else {
    nextRewardText.textContent =
      "50% OFF reward unlocked 🎉";
  }
}
function renderCustomerRewards(stamps = 0, rewardStatus = "none") {
  const safeStamps = Math.max(
    0,
    Math.min(10, Number(stamps) || 0)
  );

  // Reset both cards first
  reward5Card.classList.remove("unlocked", "redeemed");
  reward10Card.classList.remove("unlocked", "redeemed");

  // 5TH ORDER — 25% OFF
  if (rewardStatus === "reward_5_redeemed") {
    reward5Status.textContent = "Redeemed ✓";
    reward5Message.textContent =
      "Your 25% OFF reward has been used.";
    reward5Card.classList.add("redeemed");
  } else if (safeStamps >= 5) {
    reward5Status.textContent = "Unlocked 🎁";
    reward5Message.textContent =
      "Your 25% OFF reward is ready to use.";
    reward5Card.classList.add("unlocked");
  } else {
    const remaining = 5 - safeStamps;

    reward5Status.textContent = "Locked 🔒";
    reward5Message.textContent =
      `${remaining} more ${remaining === 1 ? "order" : "orders"} to unlock this reward.`;
  }

  // 10TH ORDER — 50% OFF
  if (rewardStatus === "reward_10_redeemed") {
    reward10Status.textContent = "Redeemed ✓";
    reward10Message.textContent =
      "Your 50% OFF reward has been used.";
    reward10Card.classList.add("redeemed");

    // Reaching the 10th reward means the 5th milestone
    // was already reached earlier in this cycle.
    if (safeStamps >= 10) {
      reward5Status.textContent = "Redeemed ✓";
      reward5Message.textContent =
        "Your 25% OFF reward from this cycle has been completed.";
      reward5Card.classList.remove("unlocked");
      reward5Card.classList.add("redeemed");
    }
  } else if (safeStamps >= 10) {
    reward10Status.textContent = "Unlocked 🎁";
    reward10Message.textContent =
      "Your 50% OFF reward is ready to use.";
    reward10Card.classList.add("unlocked");
  } else {
    const remaining = 10 - safeStamps;

    reward10Status.textContent = "Locked 🔒";
    reward10Message.textContent =
      `${remaining} more ${remaining === 1 ? "order" : "orders"} to unlock this reward.`;
  }
}
async function showCustomerCard(user) {
  joinCard.classList.add("hidden");
  staffButton.classList.add("hidden");
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
renderCustomerRewards(
  loyaltyCustomer.stamps,
  loyaltyCustomer.reward_status
);
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


async function getStaffMembership(userId) {
  const { data: membership, error } = await supabaseClient
    .from("business_members")
    .select("business_id, role, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Could not check staff membership:", error);
    return null;
  }

  return membership;
}
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
  joinCard.classList.add("hidden");
  staffButton.classList.add("hidden");
  staffDashboard.classList.remove("hidden");
  await loadBusinessCustomers(membership.business_id);
  await loadStaffRecentActivity(membership.business_id);
  showMessage("");
});

closeStaffDashboard.addEventListener("click", () => {
  staffDashboard.classList.add("hidden");
  loyaltyCard.classList.remove("hidden");
});

closeCustomerDetail.addEventListener("click", () => {
  staffCustomerDetail.classList.add("hidden");
  closeCustomerDetail.classList.add("hidden");
 staffCustomerControls.classList.remove("hidden");
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
const totalCustomers = customers.length;

const totalHearts = customers.reduce(
  (total, customer) => total + (customer.stamps || 0),
  0
);

const rewardsUnlocked = customers.filter(
  (customer) => (customer.stamps || 0) >= 5
).length;

document.getElementById("totalCustomers").textContent = totalCustomers;
document.getElementById("totalHearts").textContent = totalHearts;
document.getElementById("rewardsReady").textContent = rewardsUnlocked;
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
  if (customerSearch) {
  customerSearch.oninput = () => {
    const searchTerm = customerSearch.value.toLowerCase().trim();

    document.querySelectorAll(".customer-row").forEach((row) => {
      const customerText = row.textContent.toLowerCase();

      row.style.display = customerText.includes(searchTerm)
        ? ""
        : "none";
    });
  };
}
}

async function loadStaffRecentActivity(businessId) {
  const { data: history, error } = await supabaseClient
    .from("activity_history")
    .select("description, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Could not load staff activity:", error);
    staffRecentActivity.innerHTML = "<p>Couldn't load recent activity.</p>";
    return;
  }

  if (!history || history.length === 0) {
    staffRecentActivity.innerHTML = "<p>No recent activity yet.</p>";
    return;
  }

  staffRecentActivity.innerHTML = history
    .map((item) => {
      const date = new Date(item.created_at).toLocaleString();

      return `
        <div class="history-item">
          <strong>${item.description || "Loyalty activity"}</strong>
          <small>${date}</small>
        </div>
      `;
    })
    .join("");
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
    .order("created_at", { ascending: false })
  .limit(5);

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

async function loadFullCustomerHistory(customer) {
  const { data: history, error } = await supabaseClient
    .from("activity_history")
    .select("id, activity_type, description, created_at")
    .eq("customer_id", customer.id)
    .eq("business_id", customer.business_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load full customer history:", error);
    return "<p>Could not load history.</p>";
    }
  if (!history || history.length === 0) {
    return "<p>No activity yet.</p>";
  }

  return history
    .map((item) => {
      const date = new Date(item.created_at).toLocaleString();

      return `
        <div class="history-item">
          <strong>${item.description || item.activity_type}</strong>
          <small>${date}</small>
        </div>
      `;
    })
    .join("");
}


async function openCustomerDetail(customer) {
  staffCustomerControls.classList.add("hidden");
  staffCustomerDetail.classList.remove("hidden");

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
  <h3>Recent History</h3>
  ${historyHtml}
  <button type="button" id="viewFullHistoryButton" class="staff-button">
  View Full History
</button>

<button type="button" id="backToCustomersButton" class="staff-button">
  ← Back to customers
</button>

</div>
    </div>
  `;
  const backToCustomersButton =
  document.getElementById("backToCustomersButton");

backToCustomersButton.addEventListener("click", () => {
  staffCustomerDetail.classList.add("hidden");
  staffCustomerControls.classList.remove("hidden");
});
  const staffRewardStatus = document.getElementById("staffRewardStatus");

  const viewFullHistoryButton =
  document.getElementById("viewFullHistoryButton");

if (viewFullHistoryButton) {
  viewFullHistoryButton.addEventListener("click", async () => {
    const fullHistoryHtml = await loadFullCustomerHistory(customer);

    staffCustomerDetail.innerHTML = `
      <div class="customer-detail-card">
        <h3>${customer.first_name || "Customer"} — Full History</h3>

        <div class="customer-history">
          ${fullHistoryHtml}
        </div>

        <button type="button" id="backToCustomerButton" class="staff-button">
          ← Back to Customer
        </button>
      </div>
    `;
   
    const backToCustomerButton =
      document.getElementById("backToCustomerButton");

    if (backToCustomerButton) {
      backToCustomerButton.addEventListener("click", () => {
        openCustomerDetail(customer);
      });
    }
  });
}

if (
  (stamps >= 10 &&
    customer.reward_status === "reward_10_redeemed") ||
  (stamps >= 5 &&
    stamps < 10 &&
    customer.reward_status === "reward_5_redeemed")
) {
  const redeemedReward =
    stamps >= 10 ? business?.reward_10 : business?.reward_5;

  staffRewardStatus.textContent =
    `✓ Redeemed: ${redeemedReward || "Reward"}`;
} else if (stamps >= 10 && business?.reward_10) {
  staffRewardStatus.textContent =
    `🎁 Reward unlocked: ${business.reward_10}`;

  staffRewardStatus.insertAdjacentHTML(
    "beforeend",
    '<br><button type="button" id="redeemRewardButton" class="staff-button">Redeem Reward ✓</button>'
  );
} else if (stamps >= 5 && business?.reward_5) {
  staffRewardStatus.textContent =
    `🎁 Reward unlocked: ${business.reward_5}`;

  staffRewardStatus.insertAdjacentHTML(
    "beforeend",
    '<br><button type="button" id="redeemRewardButton" class="staff-button">Redeem Reward ✓</button>'
  );
} else {
  staffRewardStatus.textContent = "";
}

const redeemRewardButton =
  document.getElementById("redeemRewardButton");

if (redeemRewardButton) {
  redeemRewardButton.addEventListener("click", async () => {
    const rewardUsed =
      stamps >= 10 ? business?.reward_10 : business?.reward_5;

    const { error: redeemError } = await supabaseClient
      .from("customers")
      .update({
        reward_status:
          stamps >= 10
            ? "reward_10_redeemed"
            : "reward_5_redeemed"
      })
      .eq("id", customer.id);

    if (redeemError) {
      console.error(redeemError);
      showMessage("Couldn't redeem the reward. Please try again.");
      return;
    }

    customer.reward_status =
      stamps >= 10
        ? "reward_10_redeemed"
        : "reward_5_redeemed";

    await recordActivity(
      customer,
      "reward_redeemed",
      `${rewardUsed} redeemed`
    );

    openCustomerDetail(customer);
  });
}

const addHeartButton =
  document.getElementById("addHeartButton");

if (addHeartButton) {
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
}

const removeHeartButton =
  document.getElementById("removeHeartButton");

if (removeHeartButton) {
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
}
async function showAccountHome(user) {
  joinCard.classList.add("hidden");
  loyaltyCard.classList.add("hidden");
  staffDashboard.classList.add("hidden");
  accountHome.classList.remove("hidden");

  businessAccountList.innerHTML = "<p>Loading your businesses...</p>";
  loyaltyAccountList.innerHTML = "<p>Loading your loyalty cards...</p>";

  const { data: memberships, error } = await supabaseClient
    .from("business_members")
   .select("business_id, role, is_active, businesses(business_name)")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) {
    console.error("Could not load businesses:", error);
    businessAccountList.innerHTML = "<p>Couldn't load your businesses.</p>";
    return;
  }

  if (!memberships || memberships.length === 0) {
    businessAccountList.innerHTML = "<p>No businesses yet.</p>";
  } else {
    businessAccountList.innerHTML = "";

    memberships.forEach((membership) => {
      const businessButton = document.createElement("button");
      businessButton.type = "button";
      businessButton.className = "staff-button";
     businessButton.textContent = `${membership.businesses?.business_name || "Your Business"} 💼`;
      businessButton.addEventListener("click", async () => {
        accountHome.classList.add("hidden");
        staffDashboard.classList.remove("hidden");
staffBusinessName.textContent =
  `${membership.businesses?.business_name || "Business"} • STAFF`;
        await loadBusinessCustomers(membership.business_id);
        await loadStaffRecentActivity(membership.business_id);
      });

      businessAccountList.appendChild(businessButton);
    });
  }
 if (loyaltyAccountList) {
  loyaltyAccountList.innerHTML = "";

  const { data: loyaltyCustomers, error: loyaltyError } =
    await supabaseClient
      .from("customers")
      .select("id, business_id, businesses(business_name)")
      .eq("user_id", user.id);

  if (loyaltyError) {
    console.error("Could not load loyalty cards:", loyaltyError);
    loyaltyAccountList.innerHTML =
      "<p>Couldn't load your loyalty cards.</p>";
  } else if (!loyaltyCustomers || loyaltyCustomers.length === 0) {
    loyaltyAccountList.innerHTML =
      "<p>No loyalty cards yet.</p>";
  } else {
    loyaltyCustomers.forEach((customer) => {
      const loyaltyButton = document.createElement("button");

      loyaltyButton.type = "button";
      loyaltyButton.className = "staff-button";
      loyaltyButton.textContent =
        `${customer.businesses?.business_name || "Loyalty"} Loyalty Card 💕`;

      loyaltyButton.addEventListener("click", async () => {
        accountHome.classList.add("hidden");
        await showCustomerCard(user);
      });

      loyaltyAccountList.appendChild(loyaltyButton);
    });
  }
}
}
async function startApp() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    await showAccountHome(session.user);
  }
}
if (nextRewardCard) {
  nextRewardCard.addEventListener("click", () => {
    customerHome.classList.add("hidden");
    customerRewardsPage.classList.remove("hidden");
  });
}
if (rewardsNavButton && rewardsBackButton) {
  rewardsNavButton.addEventListener("click", () => {
    customerHome.classList.add("hidden");
    customerRewardsPage.classList.remove("hidden");
  });

  rewardsBackButton.addEventListener("click", () => {
    customerRewardsPage.classList.add("hidden");
    customerHome.classList.remove("hidden");
  });
}
if (createBusinessButton && createBusinessPage && cancelCreateBusinessButton) {
  createBusinessButton.addEventListener("click", () => {
    accountHome.classList.add("hidden");
    createBusinessPage.classList.remove("hidden");
  });

  cancelCreateBusinessButton.addEventListener("click", () => {
    createBusinessPage.classList.add("hidden");
    accountHome.classList.remove("hidden");
  });
}

if (saveBusinessButton) {
  saveBusinessButton.addEventListener("click", async () => {
    const businessName = newBusinessName.value.trim();
    const reward5 = newReward5.value.trim();
    const reward10 = newReward10.value.trim();

    if (!businessName) {
      showMessage("Please enter a business name.");
      return;
    }

    const {
  data: { user },
} = await supabaseClient.auth.getUser();

if (!user) {
  showMessage("Please sign in again.");
  return;
}

const slug = businessName
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const { data: business, error: businessError } =
  await supabaseClient
    .from("businesses")
    .insert({
      business_name: businessName,
      owner_user_id: user.id,
      slug: slug,
      is_active: true,
      reward_5: reward5 || null,
      reward_10: reward10 || null,
    })
    .select()
    .single();

if (businessError) {
  console.error("Could not create business:", businessError);
  showMessage("Couldn't create your business. Please try again.");
  return;
}
    const { error: membershipError } = await supabaseClient
  .from("business_members")
  .insert({
    business_id: business.id,
    user_id: user.id,
    role: "owner",
    is_active: true
  });

if (membershipError) {
  console.error("Could not create membership:", membershipError);
  showMessage("Business created, but couldn't connect it to your account.");
  return;
}

showMessage("Your loyalty program was created! 💕");

createBusinessPage.classList.add("hidden");
accountHome.classList.remove("hidden");

await showAccountHome(user);
  });
}
if (historyNavButton && historyBackButton) {
 historyNavButton.addEventListener("click", async () => {
    customerHome.classList.add("hidden");
    customerRewardsPage.classList.add("hidden");
    customerHistoryPage.classList.remove("hidden");
await loadCustomerHistoryPage();
  });

  historyBackButton.addEventListener("click", () => {
    customerHistoryPage.classList.add("hidden");
    customerHome.classList.remove("hidden");
  });
}

async function loadCustomerHistoryPage() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    customerHistoryList.innerHTML =
      '<p class="history-empty">Please sign in to view your history.</p>';
    return;
  }

  const { data: customer, error: customerError } = await supabaseClient
    .from("customers")
    .select("id, business_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (customerError || !customer) {
    console.error("Could not find customer:", customerError);
    customerHistoryList.innerHTML =
      '<p class="history-empty">Could not load your history.</p>';
    return;
  }

  const { data: history, error: historyError } = await supabaseClient
    .from("activity_history")
    .select("activity_type, description, created_at")
    .eq("customer_id", customer.id)
    .eq("business_id", customer.business_id)
    .order("created_at", { ascending: false });

  if (historyError) {
    console.error("Could not load customer history:", historyError);
    customerHistoryList.innerHTML =
      '<p class="history-empty">Could not load your history.</p>';
    return;
  }

  if (!history || history.length === 0) {
    customerHistoryList.innerHTML =
      '<p class="history-empty">No loyalty activity yet. 💕</p>';
    return;
  }

  customerHistoryList.innerHTML = history
    .map((item) => {
      const date = new Date(item.created_at).toLocaleString();

      return `
        <div class="history-item">
          <strong>${item.description || "Loyalty activity"}</strong>
          <small>${date}</small>
        </div>
      `;
    })
    .join("");
}

if (profileNavButton && profileBackButton) {
  profileNavButton.addEventListener("click", async () => {
    customerHome.classList.add("hidden");
    customerRewardsPage.classList.add("hidden");
    customerHistoryPage.classList.add("hidden");
    customerProfilePage.classList.remove("hidden");

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (session?.user) {
      profileName.textContent =
        session.user.user_metadata?.first_name || "Shernzz Member";

      profileEmail.textContent =
        session.user.email || "—";

      profileMemberSince.textContent =
        new Date(session.user.created_at).toLocaleDateString();
    }
  });

  profileBackButton.addEventListener("click", () => {
    customerProfilePage.classList.add("hidden");
    customerHome.classList.remove("hidden");
  });
  signOutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.reload();
});
}
startApp();
