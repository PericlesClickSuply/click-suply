function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getAuth() {
  return JSON.parse(localStorage.getItem("auth"));
}

function setAuth(user) {
  localStorage.setItem("auth", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("auth");
  window.location.href = "login.html";
}

function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.log("setupLogin: formulário não encontrado");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = form.elements["username"].value.trim();
    const password = form.elements["password"].value;

    console.log("Tentando login com:", { username, password });

    const users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Usuários cadastrados:", users);

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      console.log("Usuário encontrado:", user);
      localStorage.setItem("auth", JSON.stringify(user));
      if (user.role === "admin") {
        console.log("Redirecionando para admin.html");
        window.location.href = "admin.html";
      } else {
        console.log("Redirecionando para index.html");
        window.location.href = "index.html";
      }
    } else {
      console.log("Usuário ou senha inválidos.");
      alert("Usuário ou senha inválidos.");
    }
  });
}


function setupRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value;
    const role = form.role.value;

    if (!username || !password) {
      alert("Preencha usuário e senha.");
      return;
    }

    let users = getUsers();

    if (users.find(u => u.username === username)) {
      alert("Usuário já existe.");
      return;
    }

    users.push({ username, password, role });
    setUsers(users);
    alert("Usuário cadastrado com sucesso!");
    window.location.href = "login.html";
  });
}

function protectPage(roleNeeded) {
  const auth = getAuth();
  if (!auth || auth.role !== roleNeeded) {
    window.location.href = "login.html";
  }
}

function setupAdminPanel() {
  const userTable = document.getElementById("userTable");
  const editForm = document.getElementById("editForm");
  if (!userTable || !editForm) return;

  let users = getUsers();

  function renderUsers() {
    users = getUsers();
    userTable.innerHTML = "";
    users.forEach((user, index) => {
      userTable.innerHTML += `
        <tr>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            <button onclick="editUser(${index})">Editar</button>
            <button onclick="deleteUser(${index})">Excluir</button>
          </td>
        </tr>
      `;
    });
  }

  window.editUser = function(index) {
    const user = users[index];
    document.getElementById("editIndex").value = index;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editPassword").value = user.password;
    document.getElementById("editRole").value = user.role;
    editForm.style.display = "block";
  };

  window.deleteUser = function(index) {
    const auth = getAuth();
    if (users[index].username === auth.username) {
      alert("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      users.splice(index, 1);
      setUsers(users);
      renderUsers();
    }
  };

  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById("editIndex").value);
    const username = document.getElementById("editUsername").value.trim();
    const password = document.getElementById("editPassword").value;
    const role = document.getElementById("editRole").value;

    if (!username || !password) {
      alert("Preencha usuário e senha.");
      return;
    }

    if (users.some((u, i) => u.username === username && i !== index)) {
      alert("Já existe um usuário com esse nome.");
      return;
    }

    users[index] = { username, password, role };
    setUsers(users);
    editForm.reset();
    editForm.style.display = "none";
    renderUsers();
  });

  renderUsers();
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  if (document.getElementById("loginForm")) {
    setupLogin();
  }

  if (document.getElementById("registerForm")) {
    setupRegister();
  }

  if (document.body.classList.contains("page-index")) {
    protectPage("user");
  }
  if (document.body.classList.contains("page-admin")) {
    protectPage("admin");
    setupAdminPanel();
  }
});
