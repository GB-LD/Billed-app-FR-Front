/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";

// NewBill UI Testing
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, it should them in the page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getAllByTestId("expense-type")).toBeTruthy();
      expect(screen.getAllByTestId("expense-name")).toBeTruthy();
      expect(screen.getAllByTestId("datepicker")).toBeTruthy();
      expect(screen.getAllByTestId("amount")).toBeTruthy();
      expect(screen.getAllByTestId("vat")).toBeTruthy();
      expect(screen.getAllByTestId("pct")).toBeTruthy();
      expect(screen.getAllByTestId("commentary")).toBeTruthy();
      expect(screen.getAllByTestId("file")).toBeTruthy();
      expect(screen.getByTestId('btn-send-bill')).toBeTruthy();
    })
  })
})

describe('Given I am connected as Employee, and I am on new bill page', () => {

  describe('When I am on NewBill page, and the user click on submit button', () => {
    
    test('Then, the handleSubmit function should be called', () => {
      // Mock de localStorage pour simuler la session utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Simulation de la session utilisateur connectée en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Injection du HTML de la page NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
    
      // Fonction de navigation fictive pour simuler le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Création d'une instance NewBill avec des paramètres simulés
      const store = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
    
      // Simulation que le format d'image est valide
      newBill.isImgFormatValid = true;
    
      // Récupération du formulaire de création de note de frais
      const formNewBill = screen.getByTestId("form-new-bill");
      // Définition d'une fonction de gestionnaire d'événement de soumission de formulaire fictive
      const handleSubmit = jest.fn(newBill.handleSubmit);
      // Ajout d'un écouteur d'événement de soumission de formulaire
      formNewBill.addEventListener("submit", handleSubmit);
      // Déclenchement manuel de l'événement de soumission de formulaire
      fireEvent.submit(formNewBill);
    
      // Vérification que la fonction handleSubmit a été appelée
      expect(handleSubmit).toHaveBeenCalled();
    })
    
  })

  describe('When I upload an accepted format file', () => {
    
    test('Then, the file name should be correctly displayed into the input and isImgFormatValid should be true', () => {
      // Mock de localStorage pour simuler la session utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Simulation de la session utilisateur connectée en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Injection du HTML de la page NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();

      // Fonction de navigation fictive pour simuler le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Création d'une instance NewBill avec des paramètres simulés
      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })

      // Définition d'une fonction de gestionnaire d'événement de changement de fichier fictive
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      // Récupération de l'élément input de type "file"
      const file = screen.getByTestId("file");

      // Mock de la fonction window.alert pour éviter qu'elle ne soit appelée
      window.alert = jest.fn();

      // Ajout d'un écouteur d'événement de changement de fichier
      file.addEventListener("change", handleChangeFile);
      // Déclenchement manuel de l'événement de changement de fichier avec un fichier simulé
      fireEvent.change(file, {
        target: {
          files: [new File(["file.png"], "file.png", { type: "image/png" })],
        },
      });

      // Vérification que la fonction window.alert n'a pas été appelée
      expect(alert).not.toHaveBeenCalled();

      // Vérification que la fonction handleChangeFile a été appelée
      expect(handleChangeFile).toHaveBeenCalled();
      // Vérification que le nom du fichier est correctement enregistré dans newBill.fileName
      expect(file.files[0].name).toBe("file.png");
      // Vérification que newBill.fileName contient le bon nom de fichier
      expect(newBill.fileName).toBe("file.png");
      // Vérification que newBill.isImgFormatValid est vrai car le format du fichier est accepté
      expect(newBill.isImgFormatValid).toBe(true);
      // Vérification que newBill.formData n'est pas null, indiquant que les données du formulaire sont correctes
      expect(newBill.formData).not.toBe(null);
    })
  })

  describe('When I upload an unaccepted format file', () => {

    test('Then, the file name should not be displayed into the input, isImgFormatValid should be false and an alert should be displayed', () => {
      // Mock de localStorage pour simuler la session utilisateur
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Simulation de la session utilisateur connectée en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Injection du HTML de la page NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
    
      // Fonction de navigation fictive pour simuler le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Création d'une instance NewBill avec des paramètres simulés
      const store = null
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
    
      // Définition d'une fonction de gestionnaire d'événement de changement de fichier fictive
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      // Récupération de l'élément input de type "file"
      const file = screen.getByTestId("file");
    
      // Mock de la fonction window.alert pour le test
      window.alert = jest.fn();
    
      // Ajout d'un écouteur d'événement de changement de fichier
      file.addEventListener("change", handleChangeFile);
      // Déclenchement manuel de l'événement de changement de fichier avec un fichier non pris en charge
      fireEvent.change(file, {
        target: {
          files: [new File(["file.xml"], "file.xml", { type: "file/xml" })],
        },
      });
    
      // Vérification que la fonction window.alert a été appelée
      expect(alert).toHaveBeenCalled();
    
      // Vérification que la fonction handleChangeFile a été appelée
      expect(handleChangeFile).toHaveBeenCalled();
      // Vérification que newBill.fileName est null car le format de fichier n'est pas pris en charge
      expect(newBill.fileName).toBe(null);
      // Vérification que newBill.isImgFormatValid est false car le format de fichier n'est pas pris en charge
      expect(newBill.isImgFormatValid).toBe(false);
      // Vérification que newBill.formData est undefined car le format de fichier n'est pas pris en charge
      expect(newBill.formData).toBe(undefined);
    })
  })

})
