import { OrbitControls, useHelper, useGLTF, Environment, useAnimations } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing'
import * as THREE from "three"


function MyElement3D({ isAnimating, onRecordClick, onCatClick, onTableClick, onStartClick, 
    onf1Click, onf2Click, onf3Click, onf4Click, isLoggedIn, selectedLP, setHoveredText }){
    const light1 = useRef()
    const light2 = useRef()
    const spotlight = useRef()
    const turntableRef = useRef()
    const lpCoverRef = useRef()
    const toneArmRef = useRef()
    const hoveredObjectRef = useRef(null);

    const { scene, gl, camera } = useThree()
    const model = useGLTF("./models/turntable.glb")
    const defaultLPImage = './images/reality_cover.png';
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

    useEffect(() => {
        if (turntableRef.current) {
          const turntableObject = turntableRef.current;
          if (light1.current) light1.current.target = turntableObject;
          if (light2.current) light2.current.target = turntableObject;
          if (spotlight.current) spotlight.current.target = turntableObject;
        }
      }, [turntableRef]);

    // LP 표지 
    useEffect(() => {
        let texture;

        if (!isLoggedIn || !selectedLP || !selectedLP.image) {
            //console.log("기본 LP 이미지", defaultLPImage);
            texture = new THREE.TextureLoader().load(defaultLPImage);
        } else {
            //console.log("로그인된 사용자의 이미지");
            texture = new THREE.TextureLoader().load(`data:image/png;base64,${selectedLP.image}`);
        }

        const lpObject = model.scene.getObjectByName("LpImage");
        if (lpObject) {
            lpObject.material = new THREE.MeshStandardMaterial();
            lpObject.material.map = texture;
            lpObject.material.needsUpdate = true;
        }else {
            console.warn("LpImage 객체를 찾을 수 없습니다.");
        }

    }, [isLoggedIn, selectedLP, model.scene])

    //로그인 여부에 따라서 고양이 교체
    useEffect(() => {
        if (model && model.scene) {
            const yellowCat = model.scene.getObjectByName("\byellowcat")
            const blackCat = model.scene.getObjectByName("blackcat")

            if(isLoggedIn){
                blackCat.visible = false
                yellowCat.visible = true
            } else {
                blackCat.visible = true
                yellowCat.visible = false
            }
        }

    }, [isLoggedIn, model.scene, scene])

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
        if (model && model.scene) {
            model.scene.traverse((child) => {
                if (child.name === "Tone_Arm") { // Tone Arm 이름 확인
                    toneArmRef.current = child;
                    // console.log("Tone Arm 발견:", toneArmRef.current);
                    // console.log("Tone Arm 위치:", toneArmRef.current.position);
                    // console.log("Tone Arm 위치:", toneArmRef.current.rotation);
                }
            });
        }
    }, [model]);


    // 턴테이블에서 객체 찾기 및 클릭 처리
    useEffect(() => {
        if (model && model.scene) {
            let tableMesh = null
            let lpMesh = null
            let catMesh = null
            let startMesh = null
            let f1Mesh = null
            let f2Mesh = null
            let f3Mesh = null
            let f4Mesh = null

            model.scene.traverse((child) => {
                if (child.name === "Table") {
                    tableMesh = child;
                    //console.log("Found tableMesh:", tableMesh);
                    tableMesh.userData.isInteractive = true
                    tableMesh.userData.onClick = onTableClick
                }
                if (child.name === "LP_1") {
                    lpMesh = child
                    //console.log("Found LP Mesh:", lpMesh)
                    lpMesh.userData.isInteractive = true
                    lpMesh.userData.onClick = onRecordClick
                }
                if (child.name === "blackcat") {
                    catMesh = child;
                    //console.log("Found Cat Mesh:", catMesh);
                    catMesh.userData.isInteractive = true
                    catMesh.userData.onClick = onCatClick
                }
                if (child.name === "\bF5") {
                    startMesh = child;
                    //console.log("Found startMesh:", startMesh);
                    startMesh.userData.isInteractive = true
                    startMesh.userData.onClick = onStartClick
                }
                if (child.name === "F1") {
                    f1Mesh = child;
                    //console.log("Found f1Mesh:", f1Mesh);
                    f1Mesh.userData.isInteractive = true
                    f1Mesh.userData.onClick = onf1Click
                }
                if (child.name === "F2") {
                    f2Mesh = child;
                    //console.log("Found f1Mesh:", f2Mesh);
                    f2Mesh.userData.isInteractive = true
                    f2Mesh.userData.onClick = onf2Click
                }
                if (child.name === "F3") {
                    f3Mesh = child;
                    //console.log("Found f1Mesh:", f3Mesh);
                    f3Mesh.userData.isInteractive = true
                    f3Mesh.userData.onClick = onf3Click
                }
                if (child.name === "F4") {
                    f4Mesh = child;
                    //console.log("Found f1Mesh:", f4Mesh);
                    f4Mesh.userData.isInteractive = true
                    f4Mesh.userData.onClick = onf4Click
                }
            })
    
            if (!tableMesh) console.warn("Table Mesh not found!")
            if (!lpMesh) console.warn("LP Mesh not found!")
            if (!catMesh) console.warn("Cat Mesh not found!")

            // 전체 씬에서 상호작용 설정
            scene.traverse((child) => {
                if (child.isMesh) {
                    //console.log("Mesh found:", child.name) // 모든 메쉬 이름 출력
                }
                if (child.isMesh && child.userData.isInteractive) {
                child.onClick = child.userData.onClick;
                }
            });
        }
    }, [model, scene, onRecordClick, onCatClick]);



    const handlePointerDown = (event) => {
        if (!camera || !camera.isPerspectiveCamera) {
            console.error("Camera is not a valid PerspectiveCamera!")
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
            const target = intersects[0].object
    
            // 클릭 가능한 객체인지 확인
            if (target.userData.isInteractive && target.userData.onClick) {
                console.log(`Clicked on: ${target.name}`) // 디버깅 로그
                target.userData.onClick() // 클릭 핸들러 호출
            }
        }
    }

    const handlePointerMove = (event) => {
        // Raycaster 업데이트
        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        )

        raycaster.setFromCamera(pointer, camera) // 카메라를 기준으로 Ray 생성

        // 씬 내의 모든 객체와 교차하는지 확인
        const intersects = raycaster.intersectObjects(scene.children, true)

        if (hoveredObjectRef.current) {
            resetHoverEffect(hoveredObjectRef.current);
        }

        if (intersects.length > 0) {
            const target = intersects[0].object
            hoveredObjectRef.current = target;
            applyHoverEffect(target);
            
        } else {
            setHoveredText("")
            hoveredObjectRef.current = null;
        }
    }

    const applyHoverEffect=(target) => {
        if(target.name === "blackcat"){
            console.log("검정냥");
            if(isLoggedIn){
                console.log("로그인된 노랑냥 위치", target.position.y);
                setHoveredText("♧ 로그아웃 하기 ♧");
                target.position.y = 3.0520457029342651;}
            else {
                console.log("로그인 안된 검정냥");
                setHoveredText("♧ 로그인 하기 ♧");
                target.position.y = 2.0520457029342651;}
        } else if (target.name === "LP_1"){
            setHoveredText("£ LP 변경하기 £");
            target.scale.set(1.1, 1.1, 1.1)
        } else if (target.name === 'Table'){
            setHoveredText("♤ 오늘의 LP 만들기 ♤");
            target.material.opacity = 0.5 
            target.material.transparent = true 
        } else if (target.name === 'F1'|| target.name === 'F2'|| target.name === 'F3'|| target.name === 'F4'){
            setHoveredText("† 음악 볼륨 조절 †");
            target.material.emissive.set(0xF6C2DC)
        } else if(target.name === '\bF5'){
            setHoveredText("¢ 음악 재생하기/멈추기 ¢");
            target.material.emissive.set(0xFEAEC6)
        }
    }

    const resetHoverEffect = (child) => {
        if(child.name === "blackcat" || child.name === "\byellowcat"){
            child.position.y = 1.0520457029342651;
        } else if(child.name === "LP_1"){
            child.scale.set(1, 1, 1)
        } else if(child.name === 'Table'){
            child.material.opacity = 1
            child.material.transparent = false
        } else if (child.name === '\bF5'|| child.name === 'F1'|| child.name === 'F2'|| child.name === 'F3'|| child.name === 'F4'){
            child.material.emissive.set(0x000000)
        }
    }


    const handlePointerOut = () => {
        scene.traverse((child) => {
            if (child.isMesh) {
                if(child.name === "blackcat" || child.name === "\byellowcat"){
                    child.position.y = 1.0520457029342651;
                } else if(child.name === "LP_1"){
                    child.scale.set(1, 1, 1)
                } else if(child.name === 'Table'){
                    child.material.opacity = 1
                    child.material.transparent = false
                } else if (child.name === '\bF5'|| child.name === 'F1'|| child.name === 'F2'|| child.name === 'F3'|| child.name === 'F4'){
                    child.material.emissive.set(0x000000)
                   
                }
            }
            setHoveredText("")
        })
    }



    // useHelper(light1, THREE.SpotLightHelper)
    // useHelper(light2, THREE.SpotLightHelper)
    // useHelper(spotlight, THREE.SpotLightHelper)

    return(
        <>

            <OrbitControls />

            {/* <axesHelper scale={40}/> */}

            <ambientLight color={0xffffff} intensity={3} />
            
            <spotLight
                castShadow
                ref={light1}
                color={0xffffff} intensity={3}
                position={[0, 30, -15]}
                angle={THREE.MathUtils.degToRad(40)}
                penumbra={0.2}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <spotLight
                castShadow
                ref={light2}
                color={0xffffff} intensity={3}
                position={[0, 30, 15]}
                angle={THREE.MathUtils.degToRad(40)}
                penumbra={0.2}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />

            <spotLight
                castShadow
                ref={spotlight}
                color={0xffffff} intensity={5}
                position={[10, 30, 0]}
                angle={THREE.MathUtils.degToRad(30)}
                penumbra={0.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />  

            <Environment color={0xffffff} intensity={0.3} files={"./images/rosendal_plains_2_4k.hdr"} />

            <primitive 
                castShadow
                ref={turntableRef}
                scale={12}
                object={model.scene} 
                name="turntable"
                rotation-y={-89*Math.PI/180}
                position={[10, -8, 0]}
                onPointerDown={(e) => handlePointerDown(e.nativeEvent)} // 클릭 이벤트 처리
                onPointerMove={handlePointerMove}
                onPointerOut={handlePointerOut}
            />

            {selectedLP && selectedLP.image && (
                <mesh ref={lpCoverRef} position={[30, 3, 0]} rotation-y={-90 * Math.PI / 180}>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial map={new THREE.TextureLoader().load(`data:image/png;base64,${selectedLP.image}`)} />
                </mesh>
            )}



        </>
    )
}

export default MyElement3D