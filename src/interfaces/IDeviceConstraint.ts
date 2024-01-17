export interface IDeviceConstraint{
    audio:boolean|{deviceId:string|null},
    video:boolean|{
        width:number,
        height:number,
        frameRate:{ideal:number, max:number},
        facingMode:string,
        deviceId:string|null
    },
}