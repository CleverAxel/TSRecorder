import { Device } from "./objects/Device";
import { Page } from "./objects/Page";
import { IDeviceConstraint } from "./interfaces/IDeviceConstraint";
import { Recorder } from "./objects/Recorder";

//https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints

export const DOCUMENT_LANG = document.documentElement.lang;

let deviceConstraint: IDeviceConstraint;

let page = new Page(DOCUMENT_LANG);
let device = new Device();
let recorder:Recorder|null = null;

init();

async function init() {
    (await page.fetchTraductionAndBuildPage()).retrieveDOMElements();

    try {
        //askPermissions peut rater et nous envoyer dans le CATCH
        let deviceDetails = await device.askPermissions();

        deviceConstraint = {
            audio: deviceDetails.audio.hasPermission && deviceDetails.audio.exists,
            video: deviceDetails.video.hasPermission && deviceDetails.video.exists
        }

        page
        .removeUnavailableDeviceFromSelectableDevice(deviceConstraint)
        .enumerateDevicesInSelect(deviceDetails.audio.deviceId, deviceDetails.video.deviceId, deviceConstraint)
        .displayPossibilityToRecord();

        recorder = new Recorder();
        recorder.setDeviceConstraint(deviceConstraint, deviceDetails.audio.deviceId, deviceDetails.video.deviceId);


    } catch (status:any) {
        page
        .displayErrorsFromDevice(status, page.traduction.errorMessages.device)
        .removePossibilityToRecord();
    }
}