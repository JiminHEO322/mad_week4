import { OrbitControls, useHelper, useGLTF, Environment, useAnimations } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"


function MyElement3D({ isAnimating }){
    const light1 = useRef()
    const light2 = useRef()
    const spotlight = useRef()
    const turntableRef = useRef()

    const model = useGLTF("./models/turntable2.glb")
    const animations = useAnimations(model.animations, model.scene)
    const { actionName } = { actionName: animations.names[0] }

    const { scene, gl } = useThree()

    // 그림자 활성화
    useEffect(() => {
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap // 부드러운 그림자
    }, [gl])

    useEffect(()=> {
        const loader = new THREE.CubeTextureLoader()
        const texture = loader.load([
            "./images/cubemap/cube_front.png",
            "./images/cubemap/cube_back.png",
            "./images/cubemap/cube_up.png",
            "./images/cubemap/cube_down.png",
            "./images/cubemap/cube_right.png",
            "./images/cubemap/cube_left.png",
        ])
        scene.background = texture
    }, [scene])

    // 애니메이션 컨트롤
    useEffect(() => {
        const action = animations.actions[actionName]
        if (action) {
            if (isAnimating) {
                action.reset().play()
            } else {
                action.stop()
            }
        }
        return () => {
            action?.stop()
        }
    }, [isAnimating, actionName, animations.actions])

    useEffect(() => {
        const target = new THREE.Object3D()
        target.position.set(0, 0, 0)
        scene.add(target)

        if (spotlight.current) {
            spotlight.current.target = target
        }
        return () => {
            scene.remove(target)
        };
    }, [scene])

    //useHelper(light1, THREE.SpotLightHelper)
    //useHelper(light2, THREE.SpotLightHelper)
    //useHelper(spotlight, THREE.SpotLightHelper)

    return(
        <>
            <OrbitControls />

            {/* <axesHelper scale={40}/> */}

            <ambientLight color={0xffffff} intensity={3} />
            
            <spotLight
                castShadow
                ref={light1}
                color={0xffffff} intensity={5}
                position={[0, 40, -15]}
                angle={THREE.MathUtils.degToRad(40)}
                penumbra={0.2}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <spotLight
                castShadow
                ref={light2}
                color={0xffffff} intensity={5}
                position={[0, 40, 15]}
                angle={THREE.MathUtils.degToRad(40)}
                penumbra={0.2}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <spotLight
                castShadow
                ref={spotlight}
                color={0xffe4b5} intensity={8}
                position={[0, 30, 0]}
                angle={THREE.MathUtils.degToRad(30)}
                penumbra={0.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />  

            <Environment files={"./images/rosendal_plains_2_4k.hdr"} />

            <primitive 
                castShadow
                ref={turntableRef}
                scale={12}
                object={model.scene} 
                name="turntable"
                rotation-y={-90*Math.PI/180}
                position={[0, -8, 0]}
            />


        </>
    )
}

export default MyElement3D