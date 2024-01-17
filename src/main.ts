import { Device } from "./objects/Device";
import { Page } from "./objects/Page";
import { Recorder } from "./objects/Recorder";

//https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Constraints

export const DOCUMENT_LANG = document.documentElement.lang;

let mediaStreamConstraint: MediaStreamConstraints;

let page = new Page(DOCUMENT_LANG);
let device = new Device();
export const IS_MOBILE = device.checkIfMobile();
export const IS_MOBILE_OR_TABLET = device.checkIfMobileOrTablet();
let recorder:Recorder|null = null;

init();

async function init() {
    (await page.fetchTraductionAndBuildPage()).retrieveDOMElements();

    try {
        //askPermissions peut rater et nous envoyer dans le CATCH
        let deviceDetails = await device.askPermissions();

        mediaStreamConstraint = {
            audio: deviceDetails.audio.hasPermission && deviceDetails.audio.exists,
            video: deviceDetails.video.hasPermission && deviceDetails.video.exists
        }

        page
        .removeUnavailableDeviceFromSelectableDevice(mediaStreamConstraint)
        .enumerateDevicesInSelect(deviceDetails.audio.deviceId, deviceDetails.video.deviceId, mediaStreamConstraint)
        .displayPossibilityToRecord();

        recorder = new Recorder(page.traduction.recorder);
        recorder
        .setDeviceConstraint(mediaStreamConstraint, deviceDetails.audio.deviceId, deviceDetails.video.deviceId)
        .initEventListeners()
        ?.startStreamingToPreviewVideo()
        ?.then(() => {
            recorder?.openRecorder();
        });


    } catch (status:any) {
        page
        .displayErrorsFromDevice(status, page.traduction.errorMessages.device)
        .removePossibilityToRecord();
    }
}