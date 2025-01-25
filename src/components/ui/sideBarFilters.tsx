"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Check, Plus } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";

export default function SidebarFilters() {
  const allKeywords = ["Spring", "Smart", "Modern", "Summer", "Winter"]; // Lista completa
  const [keywords, setKeywords] = useState(["Spring", "Smart", "Modern"]); // Keywords activas
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [checkedLabels, setCheckedLabels] = useState<string[]>([]); // Estado independiente para los "Labels"
  const [checkedColors, setCheckedColors] = useState<string[]>([]);
  const [checkedSizes, setCheckedSizes] = useState<string[]>([]);
  const colors = ["Red", "Blue", "Green"];
  const sizes = ["Small", "Medium", "Large"];
  const labels = ["Label1", "Label2", "Label3"]; // Etiquetas para los checkboxes generales

  const updatePriceRange = (value: [number, number]) => {
    setPriceRange(value);
  };

  return (
    <Card className="w-[280px] p-6 border rounded-lg">
      {/* Keywords Section */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="bg-[#DEEFE7] text-[#002333] px-3 py-1 rounded-full flex items-center gap-1"
            >
              {keyword}
              <X
                className="h-3 w-3 cursor-pointer text-[#002333]"
                onClick={() =>
                  setKeywords((prev) => prev.filter((k) => k !== keyword))
                }
              />
            </Badge>
          ))}
        </div>

        {/* Deselected Keywords */}
        <div className="flex flex-wrap gap-2">
          {allKeywords
            .filter((keyword) => !keywords.includes(keyword))
            .map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="bg-[#B4BEC9] text-[#002333] px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                onClick={() => setKeywords((prev) => [...prev, keyword])}
              >
                {keyword}
                <Plus className="h-3 w-3 text-[#002333]" />
              </Badge>
            ))}
        </div>
      </div>

      {/* Labels Section */}
      <div className="mb-6">
        {labels.map((label, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div
              className={`w-5 h-5 flex items-center justify-center border rounded ${
                checkedLabels.includes(label)
                  ? "bg-[#002333] text-white"
                  : "border-[#B4BEC9]"
              }`}
              onClick={() => {
                const updatedLabels = checkedLabels.includes(label)
                  ? checkedLabels.filter((l) => l !== label)
                  : [...checkedLabels, label];
                setCheckedLabels(updatedLabels);
              }}
            >
              {checkedLabels.includes(label) && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <label
                htmlFor={`label-${index}`}
                className="text-sm font-medium text-[#002333]"
              >
                {label}
              </label>
              <p className="text-sm text-[#B4BEC9]">Description</p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-2 text-[#002333]">
          Price Range
        </h3>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={priceRange}
          min={0}
          max={100}
          step={1}
          onValueChange={updatePriceRange}
        >
          <Slider.Track className="bg-[#B4BEC9] relative flex-grow rounded-full h-1">
            <Slider.Range className="absolute bg-[#002333] rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-[#002333] rounded-full" />
          <Slider.Thumb className="block w-4 h-4 bg-[#002333] rounded-full" />
        </Slider.Root>
        <div className="flex justify-between mt-1 text-[#002333]">
          <span className="text-sm">${priceRange[0]}</span>
          <span className="text-sm">${priceRange[1]}</span>
        </div>
      </div>

      {/* Color Section */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-2 text-[#002333]">Color</h3>
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div
              className={`w-5 h-5 flex items-center justify-center border rounded ${
                checkedColors.includes(color)
                  ? "bg-[#002333] text-white"
                  : "border-[#B4BEC9]"
              }`}
              onClick={() => {
                const updatedColors = checkedColors.includes(color)
                  ? checkedColors.filter((c) => c !== color)
                  : [...checkedColors, color];
                setCheckedColors(updatedColors);
              }}
            >
              {checkedColors.includes(color) && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <label
              htmlFor={`color-${index}`}
              className="text-sm text-[#002333]"
            >
              {color}
            </label>
          </div>
        ))}
      </div>

      {/* Size Section */}
      <div>
        <h3 className="text-base font-medium mb-2 text-[#002333]">Size</h3>
        {sizes.map((size, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <div
              className={`w-5 h-5 flex items-center justify-center border rounded ${
                checkedSizes.includes(size)
                  ? "bg-[#002333] text-white"
                  : "border-[#B4BEC9]"
              }`}
              onClick={() => {
                const updatedSizes = checkedSizes.includes(size)
                  ? checkedSizes.filter((s) => s !== size)
                  : [...checkedSizes, size];
                setCheckedSizes(updatedSizes);
              }}
            >
              {checkedSizes.includes(size) && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <label htmlFor={`size-${index}`} className="text-sm text-[#002333]">
              {size}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
