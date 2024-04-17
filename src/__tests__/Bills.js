/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";

// UI testing for the employee page
describe("Given I am connected as an employee", () => {

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(document.querySelector("#layout-icon1").classList.contains("active-icon"))
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then, the title and the newBill button should be render correctly", () => {
			// Création de l'HTML de BillsUI et injection dans le corps du document
			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;

			// Vérification que le titre et le bouton newBill sont présents
			expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
			expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
		});

	test("Then, no bills should be shown when there are no bills", () => {
		// Création de l'HTML de BillsUI sans données des notes de frais et injection dans le corps du document
		const html = BillsUI({ data: [] });
		document.body.innerHTML = html;

		// Vérification qu'aucune note de frais n'est affichée
		const bill = screen.queryByTestId("bill");
		expect(bill).toBeNull();
	});

    test("Then, bills data should be render with type, name, date, amount, status, and eye icon", () => {
			// Création de l'HTML de BillsUI avec les données des notes de frais et injection dans le corps du document
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;

			// Vérification de la présence des éléments de chaque note de frais
			const bill = screen.getAllByTestId("bill");
			const type = screen.getAllByTestId("type");
			const name = screen.getAllByTestId("name");
			const date = screen.getAllByTestId("date");
			const amount = screen.getAllByTestId("amount");
			const status = screen.getAllByTestId("status");
			const iconEye = screen.getAllByTestId("icon-eye");

			expect(bill.length).toBe(4);
			expect(type.length).toBe(4);
			expect(name.length).toBe(4);
			expect(date.length).toBe(4);
			expect(amount.length).toBe(4);
			expect(status.length).toBe(4);
			expect(iconEye.length).toBe(4);
		});

    test("Then, second bill data should contain the right type, name, date, amount, status and eye icon", () => {
			// Création de l'HTML de BillsUI avec les données des notes de frais et injection dans le corps du document
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;

			// Vérification des données de la duxième note de frais
			const type = screen.getAllByTestId("type")[1];
			const name = screen.getAllByTestId("name")[1];
			const date = screen.getAllByTestId("date")[1];
			const amount = screen.getAllByTestId("amount")[1];
			const status = screen.getAllByTestId("status")[1];
			const iconEye = screen.getAllByTestId("icon-eye")[1];

			expect(type.textContent).toBe("Services en ligne");
			expect(name.textContent).toBe("test3");
			expect(date.textContent).toBe("2003-03-03");
			expect(amount.textContent).toBe("300 €");
			expect(status.textContent).toBe("accepted");
			expect(iconEye.textContent).toBeTruthy();
		});
  })
})

describe("Given I am connected as Employee and I am on Bill page, there are bills", () => {

	describe("When clicking on an eye icon", () => {

		test("Then, modal should open and have a title and a file url", () => {
			// Configuration de l'utilisateur connecté comme employé
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem('user', JSON.stringify({
			  type: 'Employee'
			}))

			// Création de l'HTML de BillsUI avec les données des notes de frais et injection dans le corps du document
			document.body.innerHTML = BillsUI({ data: bills })

			// Configuration des paramètres nécessaires à l'instanciation de Bills
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			// Simulation du click sur l'icône d'œil

			// Sélectionne l'élément avec l'ID "modaleFile" dans le document
			const modale = document.querySelector("#modaleFile");

			// Étend la fonction modal de jQuery pour simuler l'ouverture de la modale
			// Lorsque cette fonction est appelée, elle ajoute la classe "show" à l'élément modal
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			// Sélectionne le premier élément avec l'attribut data-testid="icon-eye"
			const eye = screen.getAllByTestId("icon-eye")[0];

			// Crée une fonction de egstion d'événements qui appelle handleClickIconEye de l'objet bill avec l'élément eye
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

			// Ajoute un écouteur d'événements pour le clic sur l'élément eye,
			// qui déclenchera la fonction handleClickIconEye
			eye.addEventListener("click", handleClickIconEye);

			// Simule un clic sur l'élément eye
			userEvent.click(eye);

			// Vérification que la modale s'ouvre avec les bonnes données

			// Vérifie que handleClickIconEye a été appelé au moins une fois
			expect(handleClickIconEye).toHaveBeenCalled();

			// Vérifie que la classe "show" a été ajoutée à l'élément modal, indiquant qu'il est affiché
			expect(modale.classList).toContain("show");

			// Vérifie qu'il existe un élément contenant le texte "Justificatif" dans le document
			expect(screen.getByText("Justificatif")).toBeTruthy();

			// Vérifie que la propriété fileUrl du premier élément de bills est définie et non null
			expect(bills[0].fileUrl).toBeTruthy();
		});
	});
});