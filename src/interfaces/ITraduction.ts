export interface ITraduction {
    device: {
        audio: string,
        video: string,
    },
    recorder: ITraductionRecorder,

    errorMessages: {
        device: ITraductionErrorDevice
    }
}

export interface ITraductionRecorder{
    main:string,
    leaveWhileRecording:string,
    video:{
        disable:string,
        button:{
            stop:string,
            resume:string,
            start:string,
            pause:string,
            toggleVideoDevice:string
        }
    }
}

export interface ITraductionErrorDevice{
    default: string,
    /**
     * Aucun périphérique disponible.
     */
    unavailableAudioDeviceVideoDevice: string,

    /**
     * Aucune permission pour utiliser les périphériques disponibles
     */
    unavailablePermissionToUseDevices: string,

    /**
     * N'a pas la permission d'utiliser le micro avec la vidéo.
     */
    unavailablePermissionToUseAudioDeviceWithVideoDevice: string,
    unknownError: string,
}