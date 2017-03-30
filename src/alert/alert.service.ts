import {
	EventEmitter,
	Injector,
	ComponentRef,
	ComponentFactory,
	ComponentFactoryResolver,
	Injectable,
	ApplicationRef
} from "@angular/core";

import { Alert } from "./alert.component";

@Injectable()
export class AlertService {
public componentFactory: ComponentFactory<any>;
public alertRefs = new Array<ComponentRef<any>>();
public onClose: EventEmitter<any> = new EventEmitter();

	constructor(public injector: Injector,
		public componentFactoryResolver: ComponentFactoryResolver, public applicationRef: ApplicationRef) {
	}

	showAlert(alertObj, alertComp = null) {
		if (!alertComp) {
			this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(Alert);
		} else {
			this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(alertComp);
		}

		let alertRef = this.componentFactory.create(this.injector);
		alertRef.instance.alertObj = alertObj;
		this.alertRefs.push(alertRef);

		this.onClose = alertRef.instance.close;
		this.applicationRef.attachView(alertRef.hostView);

		if (alertObj.target) {
			document.querySelector(alertObj.target).appendChild(alertRef.location.nativeElement);
		} else {
			let body = document.querySelector("body");

			// get or create a container for alert list
			let alertClassName = "body-alerts";
			let alertList = body.querySelector("." + alertClassName);
			if (!alertList) {
				alertList = document.createElement("div");
				alertList.className = alertClassName;
				body.appendChild(alertList);
			}

			// add the alert to the top of the list
			if (alertList.firstChild) {
				alertList.insertBefore(alertRef.location.nativeElement, alertList.firstChild);
			} else {
				alertList.appendChild(alertRef.location.nativeElement);
			}
		}

		if (alertObj.duration && alertObj.duration > 0) {
			setTimeout(() => {
				this.close(alertRef);
			}, alertObj.duration);
		}

		this.onClose.subscribe(() => {
			this.close(alertRef);
		});
	}

	close(alertRef: ComponentRef<any>) {
		if (alertRef) {
			// animation and delayed distruction
			alertRef.location.nativeElement.querySelector(".alert").classList.add("alert-dropout");
			setTimeout( () => {
				this.applicationRef.detachView(alertRef.hostView);
				alertRef.destroy();
			}, 200);
		}
	}

	ngOnDestroy() {
		if (this.alertRefs.length > 0) {
			for (let i = 0; i < this.alertRefs.length; i++) {
				let alertRef = this.alertRefs[i];
				this.applicationRef.detachView(alertRef.hostView);
				alertRef.destroy();
			}
			this.alertRefs.length = 0;
		}
	}
}
