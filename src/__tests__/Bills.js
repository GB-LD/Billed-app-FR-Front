/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router"
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockStore)

// Test du composant views/BillsUI.js
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

// Test du composant containers/Bills.js
describe("Given I am connected as Employee and I am on Bill page, there are a newBill button", () => {

	describe("When clicking on newBill button", () => {

		test("Then, bill form should open", () => {
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

			// Simulation du click sur le bouton newBill
			const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
			screen.getByTestId("btn-new-bill").addEventListener("click", handleClickNewBill);
			userEvent.click(screen.getByTestId("btn-new-bill"));

			// Vérification que le formulaire de création de note de frais s'ouvre
			expect(handleClickNewBill).toHaveBeenCalled();
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
});

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
			// Ajoute un écouteur d'événements pour le clic sur l'élément eye, qui déclenchera la fonction handleClickIconEye
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

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {

	describe("When I navigate to Bills", () => {

		test("fetches bills from mock API GET", async () => {
			// Configuration de l'utilisateur connecté comme employé dans le localStorage.
			localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

			// Création d'un élément div pour servir de racine à l'application.
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);

			// Initialisation du router de l'application.
			router();

			// Navigation vers la page des factures.
			window.onNavigate(ROUTES_PATH.Bills);

			// Attente que le texte "Mes notes de frais" soit affiché à l'écran.
			await waitFor(() => screen.getByText("Mes notes de frais"));

			// Vérification que le bouton "Nouvelle note de frais" est présent à l'écran.
			expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
		})

		// Ce bloc de test décrit le comportement lorsqu'une erreur survient lors de l'appel à l'API.
		describe("When an error occurs on API", () => {
			// Avant chaque test, on espionne la méthode mockée bills du store et on configure le localStorage pour un utilisateur connecté en tant qu'employé.
			beforeEach(() => {
				jest.spyOn(mockStore, "bills");
				Object.defineProperty(
					window,
					'localStorage',
					{ value: localStorageMock }
				);
				window.localStorage.setItem('user', JSON.stringify({
					type: 'Employee'
				}));
				const root = document.createElement("div");
				root.setAttribute("id", "root");
				document.body.appendChild(root);
				router();
			});

			// Ce test vérifie que lorsque l'API renvoie une erreur 404, un message d'erreur approprié est affiché à l'écran.
			test("fetches bills from an API and fails with 404 message error", async () => {
				// Mock de la méthode list du store pour rejeter la promesse avec une erreur 404.
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 404"));
						}
					};
				});
				// Navigation vers la page des factures.
				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				// Attente et récupération du message d'erreur affiché à l'écran.
				const message = await screen.getByText(/Erreur 404/);
				// Vérification que le message d'erreur est présent à l'écran.
				expect(message).toBeTruthy();
			});

			// Ce test vérifie que lorsque l'API renvoie une erreur 500, un message d'erreur approprié est affiché à l'écran.
			test("fetches messages from an API and fails with 500 message error", async () => {
				// Mock de la méthode list du store pour rejeter la promesse avec une erreur 500.
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 500"));
						}
					};
				});
				// Navigation vers la page des factures.
				window.onNavigate(ROUTES_PATH.Bills);
				await new Promise(process.nextTick);
				// Attente et récupération du message d'erreur affiché à l'écran.
				const message = await screen.getByText(/Erreur 500/);
				// Vérification que le message d'erreur est présent à l'écran.
				expect(message).toBeTruthy();
			});
		});
	});
});

