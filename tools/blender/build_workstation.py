import bpy
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "assets" / "3d"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def linear_rgba(hex_value):
    def convert(value):
        srgb = value / 255
        return srgb / 12.92 if srgb <= 0.04045 else ((srgb + 0.055) / 1.055) ** 2.4
    return tuple(convert(int(hex_value[i:i + 2], 16)) for i in (0, 2, 4)) + (1.0,)


def material(name, color, roughness=0.6, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = linear_rgba(color)
    mat.use_nodes = True
    bsdf = next(node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = linear_rgba(color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


WOOD = material("MAT_Warm_Walnut", "4A3826", 0.72)
WOOD_DARK = material("MAT_Walnut_Edge", "281D17", 0.62)
METAL = material("MAT_Gunmetal", "343A43", 0.46, 0.28)
SHELL = material("MAT_Workstation_Carbon", "302823", 0.78)
SHELL_DARK = material("MAT_Workstation_Shadow", "1F1A17", 0.82)
BEZEL = material("MAT_Screen_Bezel", "1B1714", 0.72, 0.01)
ACCENT = material("MAT_Power_Accent", "B17B35", 0.55, 0.02)
VENT = material("MAT_Vent_Dark", "0B0A09", 0.78, 0.03)


def rounded_box(name, size, location, mat, bevel=0.02, parent=None, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Soft industrial bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
    obj.parent = parent
    return obj


def cylinder(name, radius, depth, location, mat, vertices=24, parent=None, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth,
                                       location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj.parent = parent
    bevel = obj.modifiers.new("Edge rolloff", "BEVEL")
    bevel.width = min(radius * 0.15, depth * 0.18)
    bevel.segments = 2
    return obj


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

desk = bpy.data.objects.new("DESK_ASSET", None)
desk["asset_role"] = "static_furniture"
bpy.context.collection.objects.link(desk)

# Blender is Z-up. Three.js mapping after glTF export: (x, z, -y).
rounded_box("DeskTop_Beveled", (2.4, 1.1, 0.085), (0, 0, 0.735), WOOD, 0.035, desk)
rounded_box("DeskFrontApron", (2.34, 0.065, 0.15), (0, -0.515, 0.66), WOOD_DARK, 0.018, desk)
rounded_box("DeskRearRail", (1.98, 0.065, 0.075), (0, 0.39, 0.66), METAL, 0.012, desk)

for x in (-1.08, 1.08):
    for y in (-0.43, 0.43):
        leg = rounded_box(f"DeskLeg_{'L' if x < 0 else 'R'}_{'F' if y < 0 else 'B'}",
                          (0.095, 0.095, 0.70), (x, y, 0.35), WOOD_DARK, 0.022, desk)
        leg.rotation_euler[1] = math.radians(-2.0 if x < 0 else 2.0)

for x in (-1.08, 1.08):
    rounded_box(f"DeskBracket_{'L' if x < 0 else 'R'}", (0.2, 0.15, 0.065),
                (x, -0.41, 0.675), METAL, 0.016, desk)

# Two shallow inlays make the top read as furniture without a heavy texture atlas.
for y in (-0.18, 0.18):
    rounded_box(f"Desk_Inlay_{y:+.2f}", (2.2, 0.008, 0.008), (0, y, 0.779),
                WOOD_DARK, 0.002, desk)

crt = bpy.data.objects.new("CRT_ASSET", None)
crt["asset_role"] = "monitor_shell"
crt["screen_socket"] = "SCREEN_DYNAMIC"
bpy.context.collection.objects.link(crt)

# Main shell and tapered rear silhouette. Origin matches the existing Three.js CRT group.
rounded_box("CRT_MainShell", (0.70, 0.50, 0.55), (0, 0, 0), SHELL, 0.065, crt)
rounded_box("CRT_RearHump", (0.49, 0.25, 0.39), (0, 0.305, 0.015), SHELL_DARK, 0.075, crt)

# Four bars form a true frame so the live CanvasTexture remains visible.
front_y = -0.276
rounded_box("CRT_BezelTop", (0.62, 0.052, 0.060), (0, front_y, 0.225), BEZEL, 0.022, crt)
rounded_box("CRT_BezelBottom", (0.62, 0.052, 0.078), (0, front_y, -0.222), BEZEL, 0.022, crt)
rounded_box("CRT_BezelLeft", (0.064, 0.052, 0.405), (-0.286, front_y, 0.003), BEZEL, 0.022, crt)
rounded_box("CRT_BezelRight", (0.064, 0.052, 0.405), (0.286, front_y, 0.003), BEZEL, 0.022, crt)

# Stand is wider and lower than the old cylinder, giving the monitor a planted silhouette.
rounded_box("CRT_StandNeck", (0.14, 0.15, 0.10), (0, 0.01, -0.30), BEZEL, 0.02, crt)
rounded_box("CRT_StandBase", (0.40, 0.32, 0.055), (0, -0.005, -0.355), SHELL_DARK, 0.035, crt)
rounded_box("CRT_StandPlate", (0.27, 0.22, 0.018), (0, -0.015, -0.322), BEZEL, 0.012, crt)

# Top vents: chunky enough to catch light, sparse enough to stay quiet.
for i in range(5):
    rounded_box(f"CRT_TopVent_{i + 1}", (0.34, 0.022, 0.012),
                (0, 0.11 + i * 0.052, 0.281), VENT, 0.004, crt)

# A shallow side seam keeps the molded shell readable without a decorative color stripe.
rounded_box("CRT_SideSeam", (0.012, 0.26, 0.24), (0.353, 0.04, 0.015), SHELL_DARK, 0.004, crt)

for x in (-0.23, 0.23):
    rounded_box(f"CRT_Foot_{'L' if x < 0 else 'R'}", (0.11, 0.30, 0.035),
                (x, 0.015, -0.292), VENT, 0.012, crt)

# Add a small physical power button; the dynamic LED and branding stay in Three.js.
cylinder("CRT_PowerButton", 0.014, 0.012, (0.235, -0.304, -0.19), ACCENT,
         vertices=20, parent=crt, rotation=(math.pi / 2, 0, 0))

for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.select_set(True)
        obj["cast_shadow"] = True

bpy.context.scene["asset_name"] = "Second Layer Workstation"
bpy.context.scene["palette"] = "warm-carbon / walnut / muted-amber"

blend_path = OUT_DIR / "workstation.blend"
glb_path = OUT_DIR / "workstation.glb"
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
bpy.ops.export_scene.gltf(
    filepath=str(glb_path),
    export_format="GLB",
    export_apply=True,
    export_extras=True,
    export_materials="EXPORT",
    export_cameras=False,
    export_lights=False,
)
print(f"Wrote {blend_path}")
print(f"Wrote {glb_path}")
