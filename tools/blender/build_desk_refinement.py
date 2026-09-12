"""Build the desk-only material/geometry study; never overwrite the published asset.

Run with Blender --background --python tools/blender/build_desk_refinement.py.
The top stays at y=0.7775 in Three.js so props and the Knight landing stay put.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "3d"
bpy.ops.wm.read_factory_settings(use_empty=True)


def rgba(hex_value):
    def linear(v):
        s = v / 255
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4
    return tuple(linear(int(hex_value[i:i+2], 16)) for i in (0, 2, 4)) + (1,)


def plain(name, color, roughness, metal=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba(color)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metal
    return mat


def baked_walnut():
    # Bake actual Blender procedural color onto a reusable UV texture. No floor
    # plank pattern, fake luminous edge, or browser-side color replacement.
    mat = plain("DeskStudy_OiledWalnut", "86705B", 0.57)
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    uv = nodes.new("ShaderNodeTexCoord")
    scale = nodes.new("ShaderNodeVectorMath")
    scale.operation = "MULTIPLY"
    scale.inputs[1].default_value = (2.5, 65, 3)
    links.new(uv.outputs["UV"], scale.inputs[0])
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.0
    noise.inputs["Detail"].default_value = 3.0
    noise.inputs["Roughness"].default_value = 0.64
    links.new(scale.outputs[0], noise.inputs["Vector"])
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[0].color = rgba("75614F")
    ramp.color_ramp.elements[1].position = 0.82
    ramp.color_ramp.elements[1].color = rgba("97816B")
    middle = ramp.color_ramp.elements.new(0.49)
    middle.color = rgba("86705B")
    links.new(noise.outputs["Fac"], ramp.inputs[0])
    emission = nodes.new("ShaderNodeEmission")
    links.new(ramp.outputs[0], emission.inputs[0])
    output = nodes.get("Material Output")
    links.new(emission.outputs[0], output.inputs[0])
    image = bpy.data.images.new("DeskStudy_Walnut_BaseColor", width=1024, height=512)
    target = nodes.new("ShaderNodeTexImage")
    target.image = image
    nodes.active = target
    bpy.ops.mesh.primitive_plane_add(size=2)
    plane = bpy.context.object
    plane.data.materials.append(mat)
    bpy.context.scene.render.engine = "CYCLES"
    bpy.context.scene.cycles.samples = 1
    bpy.context.scene.render.bake.margin = 8
    bpy.ops.object.bake(type="EMIT")
    bpy.data.objects.remove(plane, do_unlink=True)
    image.pack()
    for node in list(nodes):
        if node not in (target, output, nodes.get("Principled BSDF")):
            nodes.remove(node)
    shader = nodes.get("Principled BSDF")
    links.new(target.outputs["Color"], shader.inputs["Base Color"])
    links.new(shader.outputs[0], output.inputs[0])
    return mat


wood = baked_walnut()
edge = plain("DeskStudy_Endgrain", "6F5946", 0.61)
metal = plain("DeskStudy_BlackenedSteel", "3D3934", 0.46, 0.5)
rubber = plain("DeskStudy_RubberFeet", "252320", 0.85)
root = bpy.data.objects.new("DESK_REFINED", None)
bpy.context.collection.objects.link(root)
root["asset_role"] = "desk_only_preview"


def box(name, size, location, material, radius=0.008, vertical_grain=False):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name, obj.dimensions, obj.parent = name, size, root
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    # Face-aligned UVs rather than the cube's default cross-shaped atlas.
    # Every wide face gets a complete grain field; legs run lengthwise.
    uv = obj.data.uv_layers.active.data
    for poly in obj.data.polygons:
        axis = max(range(3), key=lambda i: abs(poly.normal[i]))
        a, b = ((0, 1) if axis == 2 else (0, 2) if axis == 1 else (1, 2))
        if vertical_grain and axis != 2:
            a, b = b, a
        for li in poly.loop_indices:
            co = obj.data.vertices[obj.data.loops[li].vertex_index].co
            uv[li].uv = (co[a] / size[a] + 0.5, co[b] / size[b] + 0.5)
    bevel = obj.modifiers.new("Hand finished edge", "BEVEL")
    bevel.width, bevel.segments = radius, 5
    bevel.affect = "EDGES"
    bevel.harden_normals = True
    for poly in obj.data.polygons:
        poly.use_smooth = True
    normals = obj.modifiers.new("Weighted furniture normals", "WEIGHTED_NORMAL")
    normals.keep_sharp = True
    return obj


# Same footprint and exact top height as the published desktop. A shallow
# underside gives a crisp, readable edge without a bulky dark front apron.
box("DeskStudy_Top", (2.4, 1.1, 0.062), (0, 0, 0.7465), wood, 0.014)
box("DeskStudy_Undercut", (2.32, 1.015, 0.022), (0, 0.009, 0.708), edge, 0.009)
box("DeskStudy_RearRail", (1.94, 0.055, 0.09), (0, 0.405, 0.65), edge)
box("DeskStudy_LeftApron", (0.055, 0.88, 0.095), (-1.05, 0, 0.65), wood)
# The existing right-hand cabinet supports the right side: no hidden duplicate legs.
for y, label in ((-0.43, "Front"), (0.43, "Back")):
    leg = box("DeskStudy_LeftLeg_" + label, (0.09, 0.09, 0.68),
              (-1.055, y, 0.355), wood, 0.012, vertical_grain=True)
    box("DeskStudy_Foot_" + label, (0.088, 0.088, 0.018),
        (-1.055, y, 0.018), rubber, 0.006)
    box("DeskStudy_Bracket_" + label, (0.13, 0.11, 0.025),
        (-1.055, y, 0.687), metal, 0.004)
# Cabinet cap reaches the underside; preserves the existing cabinet position.
# Blender (x,y,z) -> Three.js (x,z,-y), cabinet yaw=-0.035.
support = box("DeskStudy_CabinetMount", (0.375, 0.475, 0.0205),
              (0.96, -0.12, 0.69975), edge, 0.004)
support.rotation_euler.z = -0.035

bpy.context.scene["study"] = "2026-09-12 desk only; monitor/lights/props unchanged"
bpy.context.scene["top_height_m"] = 0.7775
bpy.context.preferences.filepaths.save_version = 0
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "desk-refined.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT / "desk-refined.glb"), export_format="GLB",
                          export_apply=True, export_extras=True, export_materials="EXPORT",
                          export_cameras=False, export_lights=False)
print("DESK_STUDY_COMPLETE", OUT / "desk-refined.glb")
