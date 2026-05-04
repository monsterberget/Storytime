import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryCard from "./StoryCard";
import type { Story } from "../types";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockStory: Story = {
  id: "1",
  user_id: "user-1",
  title: "The Brave Fox",
  prompt: "A fox adventure",
  sections: [
    { text: "Once upon a time...", image_url: "https://example.com/img.png" },
  ],
  created_at: "2024-01-15T00:00:00Z",
  likes: 42,
};

describe("StoryCard", () => {
  it("renders title and excerpt", () => {
    render(<StoryCard story={mockStory} />);
    expect(screen.getByText("The Brave Fox")).toBeInTheDocument();
    expect(screen.getByText("Once upon a time...")).toBeInTheDocument();
  });

  it("displays likes count", () => {
    render(<StoryCard story={mockStory} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("renders image when present", () => {
    render(<StoryCard story={mockStory} />);
    const img = screen.getByAltText("The Brave Fox") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/img.png");
  });

  it("shows placeholder when no image", () => {
    const noImageStory = {
      ...mockStory,
      sections: [{ text: "Once upon a time..." }],
    };
    render(<StoryCard story={noImageStory} />);
    expect(screen.getByText("📖")).toBeInTheDocument();
  });
});
