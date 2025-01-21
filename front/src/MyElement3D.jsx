import { OrbitControls, useHelper, useGLTF, Environment, useAnimations } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from "three"


function MyElement3D({ isAnimating, onRecordClick, onCatClick }){
    const [isHovered, setIsHovered] = useState(null)
    const light1 = useRef()
    const light2 = useRef()
    const spotlight = useRef()
    const turntableRef = useRef()

    const { scene, gl, camera } = useThree()
    const model = useGLTF("./models/turntable.glb")
    const animations = useAnimations(model.animations, model.scene)
    const { actionName } = { actionName: animations.names[0] }


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


    // LP & cat 객체 찾기 및 클릭 처리
    useEffect(() => {
        if (model && model.scene) {
            console.log("Model loaded:", model)
            console.log("Scene children:", model.scene.children)
            let lpMesh = null
            let catMesh = null

            model.scene.traverse((child) => {
                if (child.name === "LP_1") {
                    lpMesh = child
                    console.log("Found LP Mesh:", lpMesh)
                    lpMesh.userData.isInteractive = true
                    lpMesh.userData.onClick = onRecordClick
                }
                if (child.name === "\bcat") {
                    catMesh = child;
                    console.log("Found Cat Mesh:", catMesh);
                    catMesh.userData.isInteractive = true
                    catMesh.userData.onClick = onCatClick
                }
            })
    
            if (!lpMesh) console.warn("LP Mesh not found!")
            if (!catMesh) console.warn("Cat Mesh not found!")

            // 전체 씬에서 상호작용 설정
            scene.traverse((child) => {
                if (child.isMesh) {
                    console.log("Mesh found:", child.name) // 모든 메쉬 이름 출력
                }
                if (child.isMesh && child.userData.isInteractive) {
                child.onClick = child.userData.onClick;
                }
            });
        }
    }, [model, scene, onRecordClick, onCatClick]);


    const handlePointerDown = (event) => {
        if (!camera || !camera.isPerspectiveCamera) {
            console.error("Camera is not a valid PerspectiveCamera!");
            return;
        }

        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        )

        raycaster.setFromCamera(pointer, camera) // 카메라를 기준으로 Ray 생성
        const intersects = raycaster.intersectObjects(scene.children, true) // 씬의 모든 객체와 교차 감지
    
        if (intersects.length > 0) {
            const target = intersects[0].object;
    
            // 클릭 가능한 객체인지 확인
            if (target.userData.isInteractive && target.userData.onClick) {
                console.log(`Clicked on: ${target.name}`) // 디버깅 로그
                target.userData.onClick() // 클릭 핸들러 호출
            }
        }
    }


    useEffect(() => {
        console.log("--Model loaded:", model)
        console.log("--Scene children:", model.scene.children)
    }, [model])



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
                //onPointerOver={(event) => setIsHovered(event.object.name)} // Hover 상태 저장
                //onPointerOut={() => setIsHovered(null)} // Hover 상태 초기화
                onPointerDown={(e) => handlePointerDown(e.nativeEvent)} // 클릭 이벤트 처리
            />
            {/* Hover 효과 표시
            {isHovered && (
                <div style={{ position: "absolute", color: "white", background: "black", padding: "5px", borderRadius: "5px" }}>
                Hovering over: {isHovered}
                </div>
            )} */}


        </>
    )
}

export default MyElement3D