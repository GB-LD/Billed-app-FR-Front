import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.isValidFormat = false
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = (e) => {
    e.preventDefault();
  
    const file = e.target.files[0]; // Récupère le fichier sélectionné par l'utilisateur
    const fileName = file.name; // Récupère le nom du fichier
  
    // Vérifie si le format du fichier est valide (jpg, jpeg, png)
    const isValidFormat = /\.(jpg|jpeg|png)$/i.test(fileName);
    this.isImgFormatValid = isValidFormat;
  
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
  
    if (!isValidFormat) {
      // Si le format du fichier n'est pas valide
      fileInput.value = "";
      fileInput.classList.add("is-invalid");
      fileInput.classList.remove("blue-border");
      alert("Le format de votre fichier n'est pas pris en charge." + "\n" + "Seuls les .jpg, .jpeg, .png sont acceptés.");
    } else {
      // Si le format du fichier est valide
      fileInput.classList.remove("is-invalid");
      fileInput.classList.add("blue-border");
  
      const formData = new FormData();
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file);
      formData.append("email", email);
      this.formData = formData;
      this.fileName = fileName;
    }
  };
  
  handleSubmit = (e) => {
    e.preventDefault();
  
    // Récupération de l'email de l'utilisateur à partir des données stockées localement
    const email = JSON.parse(localStorage.getItem("user")).email;
  
    // Création de l'objet bill à partir des valeurs des champs de formulaire
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
  
    // Vérification si le format de l'image est valide
    if (this.isImgFormatValid) {
      // Téléchargement de l'image et création de la facture uniquement si le format de l'image est valide
      this.store.bills().create({
        data: this.formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        // Mise à jour de l'URL de l'image téléchargée et de l'ID de la facture
        this.billId = key;
        this.fileUrl = fileUrl;
      })
      .then(() => {
        // Mise à jour de la facture et redirection vers la page des factures
        this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
      })
      .catch((error) => console.error(error));
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}