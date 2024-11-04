// Importa módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, deleteUser   } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  deleteDoc,
  getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let auth;
let db;



async function fetchFirebaseConfig() {
  try {
    const response = await fetch("https://api-nca-production.up.railway.app/api/getSecretKeys");
    const firebaseConfig = await response.json();
    const app = initializeApp(firebaseConfig);

    auth = getAuth(app); // Inicializa auth e define globalmente
    db = getFirestore(app); // Inicializa db e define globalmente

    protegerPagina(); // Chamamos protegerPagina aqui para garantir que auth já esteja definido
  
    if (window.location.pathname === "/gerenciador/usuarios/") {
      getUsuarios();
    }
    if (window.location.pathname === "/gerenciador/cadastrarusuario/") {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      loadUserData(userId);
    }
  } catch (error) {
    console.error("Erro ao buscar configuração do Firebase:", error);
  }
}

// Chama a função para carregar a configuração do Firebase e inicializar o app
fetchFirebaseConfig();

// Inicializa o Firebase e configura a autenticação


// Função para configurar as informações do usuário autenticado
function configurarPerfilUsuario(user) {
  console.log(user);
  // Separa o nome completo em palavras e pega somente o primeiro e o segundo nome
  const fullName = user.displayName
    ? user.displayName.split(" ").slice(0, 2).join(" ")
    : "Administrador";
  
  document.getElementById("userName").innerHTML = fullName;
  document.getElementById("userEmail").textContent = user.email || "lorem ipsum";
  document.getElementById("userLogo").src = user.photoURL || "/assets/images/icones/icone_membro.svg";
}


// Define as páginas que devem ser protegidas
const paginasProtegidas = [
  "/gerenciador/", 
  "/gerenciador/cadastrarmembro/", 
  "/gerenciador/cadastrarnoticia/", 
  "/gerenciador/cadastrarprojeto/", 
  "/gerenciador/cadastrarpublicacao/", 
  "/gerenciador/cadastrarlaboratorio/", 
  "/gerenciador/cadastrarusuario/", 
  "/gerenciador/membros/", 
  "/gerenciador/noticias/", 
  "/gerenciador/projetos/", 
  "/gerenciador/publicacoes/",
  "/gerenciador/laboratorios/",
  "/gerenciador/usuarios/"
];

// Verifica permissão do usuário no Firestore
async function verificarPermissao(email) {
  try {
    const docRef = doc(db, "users", email); // Assumindo que os e-mails autorizados estão salvos com o ID do documento igual ao e-mail
    const docSnap = await getDoc(docRef);
    return docSnap.exists(); // Retorna verdadeiro se o documento existe, indicando que o usuário está autorizado
  } catch (error) {
    console.error("Erro ao verificar permissão de login:", error);
    return false; // Retorna falso em caso de erro de permissão
  }
}


 // Função auxiliar para verificar a senha chamando o back-end

 async function loginEmailSenha(email, senha) {
  try {
    // Primeiro, verifica se o usuário existe no Firestore
    const userDocRef = doc(db, "users", email);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("Usuário encontrado no Firestore.");


      const hashedPassword = await hashPassword(senha);

      // Se o usuário existe no Firestore, agora autenticamos com o Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      const user = userCredential.user;

      // Login bem-sucedido, então podemos continuar com a lógica de primeiro login, etc.
      alert("Login bem-sucedido!");

      // Verifica se é o primeiro login e realiza as ações necessárias
      await verificarPrimeiroLogin(user);

      

    } else {
      // Se o usuário não existe no Firestore, impede o login
      alert("Usuário não encontrado no banco de dados.");
    }
  } catch (error) {
    console.error("Erro no login com email e senha:", error);
    alert("Erro ao fazer login: " + error.message);
  }
}



async function verificarPrimeiroLogin(user) {
  const docRef = doc(db, "users", user.email);
  const userDoc = await getDoc(docRef);

  if (userDoc.exists()) {
    // Se o campo `firstLogin` existir, usamos o valor; caso contrário, consideramos como `false`.
    const isFirstLogin = userDoc.data().firstLogin ?? false;

    if (isFirstLogin) {
      window.location.href = "/gerenciador/"; // Redireciona para redefinição de senha
    } else {
      window.location.href = "/gerenciador/";
      configurarPerfilUsuario(user); 
      // Torna a interface visível para o usuário autenticado
      document.querySelector('.body-manager').style.visibility = "visible";
    }
  }
}


async function verificarSenha(password, hashedPassword) {
  try {
    const response = await fetch("https://api-nca-production.up.railway.app/api/verifyPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, hashedPassword })
    });

    if (!response.ok) {
      console.error(`Erro ao verificar senha: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.isPasswordCorrect; // Esperamos que o back-end retorne um booleano
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
}
async function protegerPagina() {
  const caminhoAtual = window.location.pathname;
  if (typeof caminhoAtual !== "string") {
    console.error("Caminho atual não é uma string:", caminhoAtual);
    return;
  }

  if (paginasProtegidas.includes(caminhoAtual)) {
    onAuthStateChanged(auth, async (user) => {
      const bodyManager = document.querySelector('.body-manager');
      const navSidebar = document.getElementById('nav-sidebar');
      
      if (!user) {
        // Redireciona para login se não estiver autenticado
        window.location.href = "/login";
      } else {
        // Obtém o documento do usuário
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userProfile = userDoc.data().profile;

          // Verifica se o perfil é "Administrador"
          if (userProfile === "Administrador") {
            // Adiciona o item ao menu de navegação
            const adminMenuItem = `
              <li>
                <a href="/gerenciador/usuarios/">
                  <i class="fa-solid fa-user"></i>
                  <span>Usuários</span>
                </a>
              </li>`;
            navSidebar.insertAdjacentHTML("beforeend", adminMenuItem);
          }

          configurarPerfilUsuario(user);  // Configura o perfil do usuário
          bodyManager.style.visibility = "visible"; // Torna visível a interface
        } else {
          window.location.href = "/login"; // Redireciona se o documento do usuário não existir
        }
      }
    });
  }

  if (caminhoAtual == "/gerenciador/usuarios/" || caminhoAtual == "/gerenciador/cadastrarusuario/"){
    onAuthStateChanged(auth, async (user) => {
      const userDocRef = doc(db, "users", user.email);
      const userDocnew = await getDoc(userDocRef);

      if (userDocnew.exists()) {
        const userProfile = userDocnew.data().profile;

        // Verifica se o perfil é "Administrador"
        if (userProfile === "Usuário") {
          window.location.href = "/gerenciador/"; // Redireciona se o documento do usuário não existir
        } 
      }
    });
  }
}


async function redefinirSenha(senhaAtual, novaSenha, confirmacaoNovaSenha) {
  try {
    // Verifica se o usuário está autenticado
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    // Verifica se a nova senha e a confirmação são iguais
    if (novaSenha !== confirmacaoNovaSenha) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }

    // Reautentica o usuário com a senha atual
    const credential = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, credential);
    console.log("Usuário reautenticado com sucesso.");

    // Atualiza a senha para a nova senha
    await updatePassword(user, novaSenha);
    console.log("Senha atualizada com sucesso.");

    // Atualiza o campo firstLogin para false no Firestore
    const userRef = doc(db, "users", user.email);
    await updateDoc(userRef, { firstLogin: false });
    console.log("Campo firstLogin atualizado para false.");

    // Redireciona para a página principal ou gerenciador
    window.location.href = "/gerenciador";
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    if (error.code === 'auth/wrong-password') {
      alert("A senha atual está incorreta.");
    } else {
      alert("Ocorreu um erro ao redefinir a senha. Tente novamente.");
    }
  }
}

async function getUsuarios() {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    let tableBody = document.getElementById("tableBody-users");
    let contador = 1;

    // Verifica se já há linhas na tabela para evitar duplicação
    let tableRows = document.getElementById("sortableTable").rows.length;
    
    if (tableRows === 1) {
      usersSnapshot.docs.forEach((docSnapshot) => {
        const userEmail = docSnapshot.id; // O ID é o email do usuário
        const userProfile = docSnapshot.data().profile; // Campo 'profile' para foto do usuário
        createNewTDUser(contador, userEmail, userProfile, tableBody);
        contador++;
      });
    }
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
  }
}




// Função para criar uma nova linha de usuário na tabela
function createNewTDUser(contador, email, profile, tableBody) {
  let tr = document.createElement('tr');
  tr.className = 'dadopesquisado';


  // Coluna: Contador
  let tdInt = document.createElement('td');
  tdInt.innerText = contador;

  // Coluna: Foto de Perfil
  let tdProfile = document.createElement('td');
  tdProfile.textContent = profile;

  // Coluna: Email
  let tdEmail = document.createElement('td');
  tdEmail.textContent = email;

  // Coluna: Ações
  let tdIcon = document.createElement('td');

  // Botão de Visualizar
  let buttonView = document.createElement('button');
  buttonView.className = 'action-button view';
  buttonView.innerText = '🔗';

  // Botão de Editar
  let buttonEdit = document.createElement('button');
  buttonEdit.className = 'action-button edit';
  buttonEdit.innerText = '✏️';
  buttonEdit.onclick = () => {
    // Redireciona para a página de cadastro com o ID do usuário como parâmetro
    window.location.href = `/gerenciador/cadastrarusuario?userId=${email}`;
  };
  buttonEdit.className = 'action-button edit';
  buttonEdit.innerText = '✏️';

  // Botão de Deletar
  let buttonDelete = document.createElement('button');
  buttonDelete.className = 'action-button delete';
  buttonDelete.innerText = '🗑️';
  buttonDelete.onclick = async () => {
    const userId = email; 
    
    try {
      // Verifica se o e-mail está associado a algum usuário autenticado
      const signInMethods = await fetchSignInMethodsForEmail(auth, userId);
      console.log(signInMethods);
      
      // Deleta o documento do Firestore
      await deleteDoc(doc(db, "users", userId));
      alert("Usuário excluído do Firestore com sucesso!");

      // Se o usuário estiver autenticado, também exclui do Firebase Authentication
      if (signInMethods.length < 0) {
        // Se o e-mail está no Firebase Authentication, pode excluir também sem pedir a senha
        const user = await auth.getUserByEmail(userId); // Pega o usuário autenticado

        // Exclui o usuário do Firebase Authentication
        await deleteUser(user);
        alert("Usuário excluído do Firebase Authentication também!");
      }

      // Recarrega a página para atualizar a lista de usuários
      window.location.href = '/gerenciador/usuarios/';
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      alert("Erro ao deletar usuário. Confira os logs.");
    }
  };

  // Adiciona os botões à coluna de ícones
  tdIcon.appendChild(buttonView);
  tdIcon.appendChild(buttonEdit);
  tdIcon.appendChild(buttonDelete);

  // Adiciona as colunas à linha
  tr.appendChild(tdInt);
  tr.appendChild(tdEmail);
  tr.appendChild(tdProfile);
  tr.appendChild(tdIcon);

  // Adiciona a linha ao corpo da tabela
  tableBody.appendChild(tr);
}


async function loadUserData(userId) {
  if (userId) {
    const docRef = doc(db, "users", userId);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists) {
      const userData = userDoc.data();
      document.getElementById('email').value = userId;
      document.getElementById('profile').value = userData.profile;
    }
  } else {
    
    const togglePasswordButton = document.createElement('button');
    togglePasswordButton.type = 'button';
    togglePasswordButton.id = 'togglePasswordButton';
    togglePasswordButton.style.display = 'inline';
    togglePasswordButton.innerText = 'Adicionar Senha';

    togglePasswordButton.onclick = () => {
      const passwordFieldsContainer = document.getElementById('passwordFieldsContainer');

      // Verifica se os campos de senha já estão visíveis
      if (passwordFieldsContainer.children.length === 0) {
        const passwordFields = `
          <div class="passwordFields" id="passwordFields">
            <label>Senha:</label>
            <input type="password" id="password" required />
          </div>
          <div class="passwordFields" id="passwordFields">
            <label>Confirmação de Senha:</label>
            <input type="password" id="confirmPassword" required />
          </div>`;
        
        // Insere os campos de senha no contêiner
        passwordFieldsContainer.insertAdjacentHTML('beforeend', passwordFields);
        
        // Altera o texto do botão para "Remover Senha"
        togglePasswordButton.innerText = 'Remover Senha';
      } else {
        // Se os campos de senha já existem, remove-os
        passwordFieldsContainer.innerHTML = '';
        
        // Altera o texto do botão para "Adicionar Senha"
        togglePasswordButton.innerText = 'Adicionar Senha';
      }
    };

    document.getElementById('Formulario').appendChild(togglePasswordButton);

    // Alterar o título para "Cadastre um novo usuário"
    document.querySelector('.tituloForm').innerText = "Cadastre um novo usuário";
    
    
  }
}

// Função para salvar ou atualizar o usuário
async function saveUser(userId) {
  // Captura os valores de email e perfil do formulário
  const email = document.getElementById('email').value;
  const profile = document.getElementById('profile').value;

  // Define o objeto userData inicial
  let userData = { profile };

  try {
    // Verifica se estamos editando ou criando um novo usuário
    if (userId) {
      // Atualiza o usuário existente no Firestore
      await setDoc(doc(db, "users", userId), userData, { merge: true });
    } else {
      // Caso seja um novo usuário, verifica se existe um campo de senha
      const passwordField = document.getElementById('passwordFields');
      if (passwordField) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Valida as senhas
        if (password !== confirmPassword) {
          alert("As senhas não coincidem.");
          return;
        }

        // Verifica se o e-mail já está em uso
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          alert("O e-mail já está em uso. Tente fazer login ou use um e-mail diferente.");
          return;
        }



        // Adiciona a senha hasheada ao objeto userData e indica que é o primeiro login
        const hashedPassword = await hashPassword(password);  // Função hashPassword para hashear a senha
        if (!hashedPassword) {
          alert("Erro ao hashear senha.");
          return;
        }
                // Cria o usuário no Firebase Authentication com o email e senha fornecidos
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        userData = {
          ...userData,
          senha: hashedPassword,
          firstLogin: true
        };
      }

      // Cria o novo usuário no Firestore com o userData completo
      await setDoc(doc(db, "users", email), userData);
    }

    // Notifica o usuário e redireciona
    alert("Usuário salvo com sucesso!");
    window.location.href = '/gerenciador/usuarios/';
  } catch (error) {
    console.error('Erro ao salvar o usuário:', error);
    alert("Erro ao salvar o usuário. Tente novamente.");
  }
}

// Função auxiliar para realizar o hashing da senha via back-end
async function hashPassword(password) {
  try {
    const response = await fetch("https://api-nca-production.up.railway.app/api/hashPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      console.error(`Erro ao hashear senha: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.hashedPassword;
  } catch (error) {
    console.error('Erro ao obter hash da senha:', error);
    return null;
  }
}




// Evento de envio do formulário




// Login com Email e Senha
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Impede o envio padrão
      const email = document.getElementById("emailInput").value;
      const senha = document.getElementById("senhaInput").value;
      loginEmailSenha(email, senha);
    });
  }

 // Login com Google

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          const autorizado = verificarPermissao(result.user.email);
          if (autorizado) {
            window.location.href = "/gerenciador"; // Redireciona para a área de gerenciador
          } else {
            signOut(auth); // Desloga o usuário imediatamente
            window.location.href = "/login"; // Redireciona para login se não tiver permissão
          }
        })
        .catch((error) => {
          console.error("Erro no login:", error);
        });
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          const bodyManager = document.querySelector('.body-manager');
          if (bodyManager) {
            bodyManager.style.visibility = "hidden";
          }
          window.location.href = "/"; // Redireciona após logout
        })
        .catch((error) => console.error("Erro no logout:", error));
    });
  }



  const resetsenha= document.getElementById("redefinirSenhaBtn");
  if (resetsenha) {
    resetsenha.addEventListener("click", () => {
      const senhaAtual = document.getElementById("senhaAtual").value;
      const novaSenha = document.getElementById("novaSenha").value;
      const confirmacaoNovaSenha = document.getElementById("confirmacaoNovaSenha").value;

      if (novaSenha.length >= 6) {  // Verificação de segurança mínima
        redefinirSenha(senhaAtual, novaSenha, confirmacaoNovaSenha);
      } else {
        alert("A nova senha deve ter pelo menos 6 caracteres.");
      }
    });
  }


  const form = document.getElementById('Formulario');

if (form) {
  form.onsubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    saveUser(userId);
  };
}

});
