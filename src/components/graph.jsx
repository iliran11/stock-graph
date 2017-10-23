import * as THREE from "three";
import React, { Component } from 'react';
import d3 from 'd3'

class Graph extends Component {
    constructor(props) {
        super(props);
        this.animate = this.animate.bind(this)
        this.triggerNewLine = this.triggerNewLine.bind(this)
        this.setPointerPosition = this.setPointerPosition.bind(this)
        this.shiftGraph = this.shiftGraph.bind(this)
        this.removeLine = this.removeLine.bind(this)
        this.camera = this.initCamera()
        this.scene = new THREE.Scene()
        this.renderer = null
        this.pointer = this.createPointer()
        this.borders = {
            xLeft: -40,
            xRight: 0,
            yTop: 40,
            yBottom: -35,
            topRandomNumber: 40
        };
        this.state = {
            x: this.borders.xLeft,
            y: 0,
            lines: []
        }
    }
    isOnEdge() {
        return this.state.x > this.borders.xRight;
    }
    getNormalizedValue(yValue) {
        const randomNumber = this.randomNumber()
        // Returns a function that "scales" Y coordinates from the data to fit the chart
        return d3.scale.linear()
            /** domain of random of numbers the scale can expect */
            .domain([this.borders.topRandomNumber * -1, this.borders.topRandomNumber])
            /** range of change to be passes. */
            .range([this.borders.yBottom / 2, this.borders.yTop / 2])(randomNumber)
    }
    betweenNumbers(min, max, number) {
        return number > min && number < max;
    }
    removeLine() {
        this.scene.remove(this.state.lines[0]);
        const newArray = this.state.lines.splice(0)
        newArray.shift()
        this.setState({
            lines: newArray
        })
    }
    triggerNewLine() {
        if (this.isOnEdge()) {
            this.removeLine();
            this.shiftGraph();
            this.setState({
                x: this.state.x - 1
            })
        }
        const endX = this.state.x + 1;
        const computedEndY = this.state.y + this.getNormalizedValue();
        const endY = this.betweenNumbers(
            this.borders.yBottom,
            this.borders.yTop,
            computedEndY
        )
            ? computedEndY
            : this.state.y;
        this.loadLine({
            startX: this.state.x,
            startY: this.state.y,
            endX,
            endY
        });
        this.setState({
            x: endX,
            y: endY
        })
        this.setPointerPosition(this.state.x, this.state.y)
    }
    shiftGraph() {
        this.state.lines.forEach(element => {
            element.geometry.vertices[0].x -= 1;
            element.geometry.vertices[1].x -= 1;
            element.geometry.verticesNeedUpdate = true;
        });
    }
    randomNumber() {
        const randomNumber = Math.floor(Math.random() * this.borders.topRandomNumber) + 1;
        const direction = Math.random() < 0.5 ? -1 : 1;
        return randomNumber * direction;
    }
    setPointerPosition(x, y) {
        this.pointer.position.set(x, y, 0)
    }
    loadLine(options) {
        const { startX, startY, endX, endY } = options;
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 10
        });
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(startX, startY, 0));
        geometry.vertices.push(new THREE.Vector3(endX, endY, 0));
        const line = new THREE.Line(geometry, material);
        this.state.lines.push(line);

        this.scene.add(line);
    }
    componentDidMount() {
        var renderer = new THREE.WebGLRenderer();
        this.mount.appendChild(renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer = renderer;
        this.animate();
        setInterval(this.triggerNewLine, 100);
        this.scene.add(this.pointer)
    }
    animate() {
        requestAnimationFrame(this.animate)
        this.renderer.render(this.scene, this.camera);
    }
    createPointer() {
        var aSphereGeo = new THREE.SphereGeometry(0.5);
        var aSphereMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        console.log(new THREE.Mesh(aSphereGeo, aSphereMat))
        return new THREE.Mesh(aSphereGeo, aSphereMat);
    }
    initCamera() {
        /** https://threejs.org/docs/#api/cameras/PerspectiveCamera */
        const fov = 45;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1;
        const far = 500;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(0, 0, 100);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        return camera;
    }
    render() {
        return (
            <div ref={(mount) => { this.mount = mount }}
            />

        );
    }
}

export default Graph