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
        reward_status: "none"
      })
      .select("first_name, stamps, reward_status")
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

staffButton.addEventListener("click", () => {
  showMessage(
    "Secure staff login is coming next 💕"
  );
});

async function startApp() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    await showCustomerCard(session.user);
  }
}

supabaseClient.auth.onAuthStateChange(
  (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      setTimeout(() => {
        showCustomerCard(session.user);
      }, 0);
    }
  }
);

startApp();
