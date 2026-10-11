"use server";

import { prisma } from "@/server/db";
import { ActionError, all, bool, localeOf, oneOf, reorderWrites, slugify, str } from "./helpers";
import { adminAction } from "./run";

const back = (fd: FormData) => `/admin/skills?locale=${str(fd, "locale", 10) || "en"}`;

export async function createSkillGroup(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "SkillGroup", action: "create", success: "Group added." }, async () => {
    const name = str(fd, "name", 80);
    if (!name) throw new ActionError("Give the group a name.");
    const last = await prisma.skillGroup.aggregate({ _max: { sortOrder: true } });
    const base = slugify(name) || "group";
    let key = base;
    for (let n = 2; await prisma.skillGroup.findUnique({ where: { key } }); n++) key = `${base}-${n}`;
    const group = await prisma.skillGroup.create({
      data: { key, sortOrder: (last._max.sortOrder ?? -1) + 1, translations: { create: { locale: "en", name, reviewed: true } } },
    });
    return group.id;
  });
}

export async function saveSkillGroup(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "SkillGroup", action: "update", success: "Group saved." }, async () => {
    const id = str(fd, "id", 60);
    const name = str(fd, "name", 80);
    if (!name) throw new ActionError("The group name can't be empty.");
    const data = { name, reviewed: bool(fd, "reviewed") };
    await prisma.$transaction([
      prisma.skillGroup.update({ where: { id }, data: { visible: bool(fd, "visible") } }),
      prisma.skillGroupTranslation.upsert({ where: { groupId_locale: { groupId: id, locale } }, update: data, create: { groupId: id, locale, ...data } }),
    ]);
    return id;
  });
}

export async function moveSkillGroup(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "SkillGroup", action: "reorder", success: "Order saved." }, async () => {
    const id = str(fd, "id", 60);
    const siblings = await prisma.skillGroup.findMany({ orderBy: { sortOrder: "asc" } });
    await prisma.$transaction(reorderWrites(siblings, id, str(fd, "op", 10), (gid, sortOrder) => prisma.skillGroup.update({ where: { id: gid }, data: { sortOrder } })));
    return id;
  });
}

export async function deleteSkillGroup(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "SkillGroup", action: "delete", success: "Group and its skills deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.skillGroup.delete({ where: { id } });
    return id;
  });
}

export async function createSkill(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "Skill", action: "create", success: "Skill added." }, async () => {
    const groupId = str(fd, "groupId", 60);
    const name = str(fd, "name", 60);
    if (!name) throw new ActionError("Enter the technology's name.");
    const last = await prisma.skill.aggregate({ where: { groupId }, _max: { sortOrder: true } });
    const skill = await prisma.skill.create({ data: { groupId, name, sortOrder: (last._max.sortOrder ?? -1) + 1 } });
    return skill.id;
  });
}

export async function saveSkill(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "Skill", action: "update", success: "Skill saved." }, async () => {
    const id = str(fd, "id", 60);
    const name = str(fd, "name", 60);
    if (!name) throw new ActionError("The name can't be empty.");
    const current = await prisma.skill.findUniqueOrThrow({ where: { id } });
    const groups = await prisma.skillGroup.findMany({ select: { id: true } });
    const groupId = oneOf(fd, "groupId", groups.map((g) => g.id), current.groupId);
    const projectIds = all(fd, "projectIds");
    const known = await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true } });
    const symbol = str(fd, "symbol", 3);
    const usage = str(fd, "usage", 2000);
    const reviewed = bool(fd, "reviewed");
    await prisma.$transaction([
      prisma.skill.update({
        where: { id },
        data: {
          name,
          symbol: symbol || null,
          visible: bool(fd, "visible"),
          groupId,
          // Moving to another group puts the skill at the end of it.
          ...(groupId !== current.groupId ? { sortOrder: 999 } : {}),
        },
      }),
      prisma.skillTranslation.upsert({
        where: { skillId_locale: { skillId: id, locale } },
        update: { usage, reviewed },
        create: { skillId: id, locale, usage, reviewed },
      }),
      prisma.skillProject.deleteMany({ where: { skillId: id } }),
      prisma.skillProject.createMany({ data: known.map((p) => ({ skillId: id, projectId: p.id })) }),
    ]);
    return id;
  });
}

export async function moveSkill(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "Skill", action: "reorder", success: "Order saved." }, async () => {
    const id = str(fd, "id", 60);
    const skill = await prisma.skill.findUniqueOrThrow({ where: { id } });
    const siblings = await prisma.skill.findMany({ where: { groupId: skill.groupId }, orderBy: { sortOrder: "asc" } });
    await prisma.$transaction(reorderWrites(siblings, id, str(fd, "op", 10), (sid, sortOrder) => prisma.skill.update({ where: { id: sid }, data: { sortOrder } })));
    return id;
  });
}

export async function deleteSkill(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "Skill", action: "delete", success: "Skill deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.skill.delete({ where: { id } });
    return id;
  });
}
