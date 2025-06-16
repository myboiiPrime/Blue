package com.techtack.blue.controller;

import com.techtack.blue.dto.UserDto;
import com.techtack.blue.dto.mapper.UserDtoMapper;
import com.techtack.blue.exception.UserException;
import com.techtack.blue.model.User;
import com.techtack.blue.service.UserService;
import com.techtack.blue.utils.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId, @RequestHeader("Authorization") String jwt) throws UserException{
        User reqUser = userService.findUserProfileByJwt(jwt);
        User user = userService.findUserById(userId);
        UserDto userDto = UserDtoMapper.toUserDto(user);
        userDto.setReq_user(UserUtil.isReqUser(reqUser, user));
        return new ResponseEntity<UserDto>(userDto, HttpStatus.ACCEPTED);
    }
}
