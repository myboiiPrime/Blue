package com.techtack.blue.controller;

import com.techtack.blue.dto.UserDto;
import com.techtack.blue.dto.mapper.UserDtoMapper;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@Valid  @PathVariable Long userId) throws UserException{
        User user = userService.findUserById(userId);
        UserDto userDto = UserDtoMapper.toUserDto(user);
        return new ResponseEntity<UserDto>(userDto, HttpStatus.ACCEPTED);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long userId,
            @RequestBody UserDto userDto) throws UserException {

        User user = UserDtoMapper.toUser(userDto);
        User updatedUser = userService.updateUser(user, userId);
        UserDto updatedUserDto = UserDtoMapper.toUserDto(updatedUser);

        return new ResponseEntity<>(updatedUserDto, HttpStatus.OK);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@Valid @PathVariable Long userId) throws UserException{
        User user = userService.findUserById(userId);
        UserDto userDto = UserDtoMapper.toUserDto(user);
        boolean isDeleted = userService.deleteUser(userId);
        if (isDeleted) {
            return new ResponseEntity<>("User Deleted", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("User Not Found", HttpStatus.OK);
        }
    }
}
