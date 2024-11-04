require 'liquid'

module Jekyll
  module RegexFilters
    # search string for regex capture group, return first or all matches
    def regex_scan(string, search, multi = false, all = false)
      # Verificar se string é nil
      return "" if string.nil?
      
      regex = multi ? /#{search}/m : /#{search}/
      matches = string.scan(regex).flatten
      
      if matches.length > 0
        return all ? matches : matches[0]
      else
        return ""
      end
    end

    # find regex capture group in string and replace
    def regex_replace(string, search, replace)
      # Verificar se string é nil
      return "" if string.nil?
      
      return string.gsub(/#{search}/m, replace)
    end

    # strip all non-letter and non-number characters from string
    def regex_strip(string)
      # Verificar se string é nil
      return "" if string.nil?
      
      return string.gsub(/[^\p{L}\p{N}]/u, " ")
    end
  end
end

Liquid::Template.register_filter(Jekyll::RegexFilters)
