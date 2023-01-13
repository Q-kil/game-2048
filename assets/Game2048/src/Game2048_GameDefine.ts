export namespace Game2048_GameDefine {
    export const SIDE_SPACE: number = 25;   //两边的间距
    const BLOCK_SPACE: number[] = [  //格子间间距(不同难度)
        15, 12, 10, 8, 5
    ]
    export const TILE_COLOR: cc.Color[] = [
        cc.color(220, 210, 200),//0
        cc.color(240, 230, 220),//2
        cc.color(240, 230, 200),//4
        cc.color(240, 170, 120),//8
        cc.color(240, 180, 120),//16
        cc.color(240, 140, 90),//32
        cc.color(240, 120, 90),//64
        cc.color(240, 90, 60),//128
        cc.color(230, 80, 40),//256
        cc.color(240, 60, 40),//512
        cc.color(240, 200, 70),//1024
        cc.color(230, 230, 0),//2048
        cc.color(10, 90, 170),//4096
        cc.color(30, 110, 170),//8192
        cc.color(30, 110, 140),//16384
        cc.color(30, 110, 140),//16384*2
    ];

    export const BURN_2_CHANCE: number = 1;        //产生2的几率

    export enum DIFFICULT {
        ['3x3'],
        ['4x4'],
        ['5x5'],
        ['6x6'],
        ['8x8'],
    };

    export function getBlockSpace(difficult: DIFFICULT) {
        return BLOCK_SPACE[difficult];
    }


}

