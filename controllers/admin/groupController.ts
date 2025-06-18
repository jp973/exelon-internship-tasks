import Group from '../../models/db/group';
import { Request, Response } from 'express';

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, maxUsers } = req.body;
    if (!name || !maxUsers) {
      return res.status(400).json({ error: "Name and maxUsers are required" });
    }

    const group = await Group.create({ name, maxUsers });
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGroups = async (_: Request, res: Response) => {
  try {
    const groups = await Group.find();
    res.status(200).json({ message: "Groups fetched successfully", groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await Group.findByIdAndUpdate(id, req.body, { new: true });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await Group.findByIdAndDelete(id);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
