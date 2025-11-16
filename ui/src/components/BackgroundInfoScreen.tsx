import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export const BackgroundInfoScreen = ({ onSubmit }) => {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    hoursPerDay: "",
    occupationType: "",
    field: "",
    bestTime: "",
    weekendAvailability: "",
    schedule: "",
    wakeUpTime: "",
    sleepPattern: "",
    freeTime: "",
    communicationStyle: "",
    hobbies: "",
    coachingStyle: "",
  });

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = () => onSubmit(form);

  return (
    <div className="p-4 pb-24 max-h-screen overflow-y-auto">
      <Card className="rounded-2xl border-none shadow-md bg-white/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Tell us about yourself
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Age</Label>
            <Input
              type="number"
              placeholder="Your age"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Input
              placeholder="Male / Female / Other"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Available hours per day</Label>
            <Input
              type="number"
              placeholder="e.g. 2"
              value={form.hoursPerDay}
              onChange={(e) => update("hoursPerDay", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Are you a student or working?</Label>
            <Select
              onValueChange={(v) => update("occupationType", v)}
              value={form.occupationType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="working">Working</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Field of study or work</Label>
            <Input
              placeholder="Your field"
              value={form.field}
              onChange={(e) => update("field", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Best time to work on goals</Label>
            <Input
              placeholder="Morning / Evening / Night"
              value={form.bestTime}
              onChange={(e) => update("bestTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Weekend availability</Label>
            <Select
              onValueChange={(v) => update("weekendAvailability", v)}
              value={form.weekendAvailability}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Work / School schedule</Label>
            <Select
              onValueChange={(v) => update("schedule", v)}
              value={form.schedule}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wake-up time</Label>
            <Input
              type="time"
              value={form.wakeUpTime}
              onChange={(e) => update("wakeUpTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Sleep pattern</Label>
            <Input
              placeholder="e.g., 11pm - 7am (8 hours)"
              value={form.sleepPattern}
              onChange={(e) => update("sleepPattern", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Free time availability</Label>
            <Input
              placeholder="e.g., 6pm - 9pm"
              value={form.freeTime}
              onChange={(e) => update("freeTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred communication style</Label>
            <Select
              onValueChange={(v) => update("communicationStyle", v)}
              value={form.communicationStyle}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short messages</SelectItem>
                <SelectItem value="detailed">Detailed guidance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hobbies & interests</Label>
            <Textarea
              placeholder="Tell us what you enjoy"
              value={form.hobbies}
              onChange={(e) => update("hobbies", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred coaching style</Label>
            <Select
              onValueChange={(v) => update("coachingStyle", v)}
              value={form.coachingStyle}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="motivational">Motivational</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full rounded-xl h-12 text-md"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
