/*
 * Firebase 초기화 + 인증/가입자 관리 API (BokAuth)
 * compat SDK 사용 → 전역 `firebase` 객체 기반. app.js 보다 먼저 로드되어야 함.
 *
 * 데이터 모델: Firestore 컬렉션 "users", 문서 id = Firebase Auth uid
 *   { userId, email, status: "pending"|"approved"|"blocked", role: "admin"|"user",
 *     watchlist: [], compareSymbols: [], createdAt, updatedAt }
 *
 * 아이디 ↔ 이메일: 사용자는 아이디(예: "louise")만 입력. 내부적으로
 *   `${id}@bok-investment.web.app` 형태의 이메일로 변환해 Firebase Auth 사용.
 */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCslRTCf4x8VHF-8DaEdFh2Aozmol0WUew",
    authDomain: "bok-investment.firebaseapp.com",
    projectId: "bok-investment",
    storageBucket: "bok-investment.firebasestorage.app",
    messagingSenderId: "934503201827",
    appId: "1:934503201827:web:cbdff3d563c90613b18596",
  };

  if (typeof firebase === "undefined") {
    console.error("Firebase SDK가 로드되지 않았습니다.");
    return;
  }

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const EMAIL_DOMAIN = "bok-investment.web.app";
  const ADMIN_ID = "louise";
  const ADMIN_EMAIL = `${ADMIN_ID}@${EMAIL_DOMAIN}`;

  const normalizeId = (id) => String(id || "").trim().toLowerCase();
  const idToEmail = (id) => `${normalizeId(id)}@${EMAIL_DOMAIN}`;
  const emailToId = (email) => String(email || "").split("@")[0];
  const isAdminId = (id) => normalizeId(id) === ADMIN_ID;
  const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

  async function getProfile(uid) {
    const snap = await db.collection("users").doc(uid).get();
    return snap.exists ? { uid, ...snap.data() } : null;
  }

  async function signUp(id, password) {
    const email = idToEmail(id);
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    const admin = isAdminId(id);
    const profile = {
      userId: normalizeId(id),
      email,
      status: admin ? "approved" : "pending",
      role: admin ? "admin" : "user",
      watchlist: [],
      compareSymbols: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await db.collection("users").doc(uid).set(profile);
    return { uid, status: profile.status, role: profile.role };
  }

  async function signIn(id, password) {
    const email = idToEmail(id);
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    const profile = await getProfile(uid);
    return { uid, profile };
  }

  async function listUsers() {
    const snap = await db.collection("users").get();
    return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  }

  async function updateUser(uid, fields) {
    await db.collection("users").doc(uid).update({ ...fields, updatedAt: serverTimestamp() });
  }

  async function deleteUserDoc(uid) {
    await db.collection("users").doc(uid).delete();
  }

  async function saveWatchlist(uid, watchlist, compareSymbols) {
    await db.collection("users").doc(uid).update({
      watchlist,
      compareSymbols,
      updatedAt: serverTimestamp(),
    });
  }

  async function setPersistence(remember) {
    const mode = remember
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    try {
      await auth.setPersistence(mode);
    } catch {
      // 일부 브라우저 컨텍스트에서 persistence 변경이 막혀도 로그인은 진행한다.
    }
  }

  window.BokAuth = {
    auth,
    db,
    ADMIN_ID,
    ADMIN_EMAIL,
    EMAIL_DOMAIN,
    normalizeId,
    idToEmail,
    emailToId,
    isAdminId,
    getProfile,
    signUp,
    signIn,
    listUsers,
    updateUser,
    deleteUserDoc,
    saveWatchlist,
    setPersistence,
    signOut: () => auth.signOut(),
    onAuthStateChanged: (cb) => auth.onAuthStateChanged(cb),
  };
})();
